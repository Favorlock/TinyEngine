class QuadTree {
    constructor(bounds, pointQuad, maxDepth, maxChildren) {
        let node;

        if (pointQuad) {
            node = new Node(bounds, 0, maxDepth, maxChildren);
        } else {
            node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
        }

        this.root = node;
    }

    insert(item) {
        if (item instanceof Array) {
            let len = item.length;
            for (let i = 0; i < len; i++) {
                this.root.insert(item[i])
            }
        } else {
            this.root.insert(item);
        }
    }

    clear() {
        this.root.clear();
    }

    retrieve(item) {
        let out = this.root.retrieve(item).slice(0);
        return out;
    }
}

class Node {
    constructor(bounds, depth = 0, maxDepth = 4, maxChildren = 4) {
        this._bounds = bounds;
        this.children = [];
        this.nodes = [];
        if (maxChildren) this._maxChildren = maxChildren;
        if (maxDepth) this._maxDepth = maxDepth;
        if (depth) this._depth = depth;
    }

    insert(item) {
        if (this.nodes.length) {
            let index = this._findIndex(item);
            this.nodes[index].insert(item);
            return;
        }

        this.children.push(item);

        let len = this.children.length;
        if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
            this.subdivide();

            for (let i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }

            this.children.length = 0;
        }
    }

    retrieve(item) {
        if (this.nodes.length) {
            let index = this._findIndex(item);
            return this.nodes[index].retrieve(item);
        }

        return this.children;
    }

    _findIndex(item) {
        let b = this._bounds;
        let left = (item.x > b.x + b.width / 2) ? false : true;
        let top = (item.y > b.y + b.height / 2) ? false : true;

        let index = Node.TOP_LEFT;
        if (left) {
            if (!top) {
                index = Node.BOTTOM_LEFT;
            }
        } else {
            if (top) {
                index = Node.TOP_RIGHT;
            } else {
                index = Node.BOTTOM_RIGHT;
            }
        }

        return index;
    }

    subdivide() {
        let depth = this._depth + 1;

        let bx = this._bounds.x;
        let by = this._bounds.y;

        let b_w_h = (this._bounds.width / 2);
        let b_h_h = (this._bounds.height / 2);
        let bx_b_w_h = bx + b_w_h;
        let by_b_h_h = by + b_h_h;

        this.nodes[Node.TOP_LEFT] = new this.constructor({
            x: bx,
            y: by,
            width: b_w_h,
            height: b_h_h
        }, depth, this._maxDepth, this._maxChildren);

        this.nodes[Node.TOP_RIGHT] = new this.constructor({
            x: bx_b_w_h,
            y: by,
            width: b_w_h,
            height: b_h_h
        }, depth, this._maxDepth, this._maxChildren);

        this.nodes[Node.BOTTOM_LEFT] = new this.constructor({
            x: bx,
            y: by_b_h_h,
            width: b_w_h,
            height: b_h_h
        }, depth, this._maxDepth, this._maxChildren);

        this.nodes[Node.BOTTOM_RIGHT] = new this.constructor({
            x: bx_b_w_h,
            y: by_b_h_h,
            width: b_w_h,
            height: b_h_h
        }, depth, this._maxDepth, this._maxChildren);
    }

    clear() {
        this.children.length = 0;
        let len = this.nodes.length;
        for (let i = 0; i < len; i++) {
            this.nodes[i].clear();
        }
        this.nodes.length = 0;
    }
}

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;

class BoundsNode extends Node {
    constructor(bounds, depth, maxChildren, maxDepth) {
        super(bounds, depth, maxChildren, maxDepth);
        this._stuckChildren = [];
    }

    insert(item) {
        if (this.nodes.length) {
            let index = this._findIndex(item);
            let node = this.nodes[index];

            if (
                item.x >= node._bounds.x &&
                item.x + item.width <= node._bounds.x + node._bounds.width &&
                item.y >= node._bounds.y &&
                item.y + item.height <= node._bounds.y + node._bounds.height
            ) {
                this.nodes[index].insert(item);
            } else {
                this._stuckChildren.push(item);
            }

            return;
        }

        this.children.push(item);

        let len = this.children.length;
        if (!(this._depth >= this._maxDepth) && len > this._maxChildren) {
            this.subdivide();
            for (let i = 0; i < len; i++) {
                this.insert(this.children[i]);
            }
            this.children.length = 0;
        }
    }

    getChildren() {
        return this.children.concat(this._stuckChildren);
    }

    retrieve(item) {
        let out = this._out;
        out.length = 0;
        if (this.nodes.length) {
            let index = this._findIndex(item);
            let node = this.nodes[index];

            if (
                item.x >= node._bounds.x &&
                item.x + item.width < node._bounds.x + node._bounds.width &&
                item.y >= node._bounds.y &&
                item.y + item.height < node._bounds.y + node._bounds.height
            ) {
                out.push.apply(out, this.nodes[index].retrieve(item));
            } else {
                if (item.x <= this.nodes[Node.TOP_RIGHT]._bounds.x) {
                    if (item.y <= this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.TOP_LEFT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[Node.BOTTOM_LEFT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.BOTTOM_LEFT].getAllContent());
                    }
                }

                if (item.x + item.width > this.nodes[Node.TOP_RIGHT]._bounds.x) {
                    if (item.y <= this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.TOP_RIGHT].getAllContent());
                    }

                    if (item.y + item.height > this.nodes[Node.BOTTOM_RIGHT]._bounds.y) {
                        out.push.apply(out, this.nodes[Node.BOTTOM_RIGHT].getAllContent());
                    }
                }
            }
        }

        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);

        return out;
    }

    getAllContent() {
        let out = this._out;

        if (this.nodes.length) {
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].getAllContent();
            }
        }

        out.push.apply(out, this._stuckChildren);
        out.push.apply(out, this.children);
    }

    clear() {
        this._stuckChildren.length = 0;

        if (!this.nodes.length) return;

        super.clear();
    }
}

BoundsNode.prototype._out = [];

export default QuadTree;