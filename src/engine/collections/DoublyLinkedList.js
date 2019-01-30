class DoublyLinkedList {
    constructor() {
        this._head = null;
        this._tail = null;
        this._size = 0;
    }

    addFirst(data) {
        let tmp = this._head;
        this._head = new Node(data, null, tmp);
        if (tmp) tmp._prev = this._head;
        if (!this._tail) this._tail = this._head;
        this._size++;
    }

    addLast(data) {
        if (this._head === null) {
            this.addFirst(data);
        } else {
            let temp = this._tail;
            this._tail = new Node(data, temp);
            temp._next = this._tail;
            this._size++;
        }
    }

    remove(data) {
        if (this._head === null) throw new Error('cannot delete');

        let cur = this._head;
        while (cur) {
            if (cur._data === data) {
                break;
            }

            cur = cur._next;
        }

        if (cur === null) throw new Error('cannot delete');
        else {
            if (cur._prev && cur._next) {
                cur._prev._next = cur._next;
                cur._next._prev = cur._prev;
            } else if (cur._prev && !cur._next) {
                this._tail = cur._prev;
                cur._prev._next = null;
            } else if (!cur._prev && cur._next) {
                this._head = cur._next;
                cur._next._prev = null;
            } else {
                this._head = null;
                this._tail = null;
            }

            this._size--;
        }
    }

    sort(comparator) {
        if (!comparator) throw new Error('cannot sort, comparator required')
        else {
            this._head = this._sort(this._head, comparator);
            this._tail = this._head;
            while (this._tail && this._tail._next) {
                this._tail = this._tail._next;
            }
        }
    }

    _sort(node, comparator, depth = 0) {
        if (!node || !node._next) return node;

        if (depth == 0) {
            // console.log(node);
            let count = 0, n =  node;
            while (n) {
                // console.log(n);
                if (count > 1000) break;
                count += 1;
                n = node._next;
            }
        }

        let right = this._split(node);

        let left = this._sort(node, comparator, depth + 1);
        right = this._sort(right, comparator, depth + 1);

        return this._merge(left, right, comparator);
    }

    _split(head) {
        let fast = head, slow = head;

        while (fast._next && fast._next._next) {
            fast = fast._next._next;
            slow = slow._next;
        }

        let temp = slow._next;
        slow._next = null;

        return temp;
    }

    _merge(first, second, comparator) {
        if (first == null) return second;
        if (second == null) return first;
        let res = comparator(first._data, second._data);
        if (res < 0) {
            first._next = this._merge(first._next, second, comparator);
            first._next._prev = first;
            first._prev = null;
            return first;
        } else {
            second._next = this._merge(first, second._next, comparator);
            second._next._prev = second;
            second._prev = null;
            return second;
        }
    }

    get head() {
        return this._head;
    }

    get tail() {
        return this._tail;
    }

    get size() {
        return this._size;
    }

    toString() {
        let arr = [], temp = this._head;
        while (temp) {
            arr.push(JSON.stringify(temp._data));
            temp = temp._next;
        }
        return arr.toString()
    }
}

class Node {
    constructor(data, prev, next) {
        this._data = data;
        this._prev = prev;
        this._next = next;
    }

    get data() {
        return this._data;
    }

    get next() {
        return this._next;
    }

    get prev() {
        return this._prev;
    }
}

export default DoublyLinkedList;