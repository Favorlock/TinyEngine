class Queue {
    constructor() {
        this.items = [];
    }

    push(element) {
        if (element instanceof Array) {
            for (let i = 0; i < element.length; i++) {
                this.items.push(element[i]);
            }
        } else {
            this.items.push(element);
        }
    }

    pop() {
        if (this.items.length == 0)
            return null;
        return this.items.shift()
    }

    peek() {
        if (this.items.length == 0)
            return null;
        return this.items[0];
    }

    isEmpty() {
        return this.items.length == 0;
    }

    clear() {
        this.items.length = 0;
    }
}

export default Queue;