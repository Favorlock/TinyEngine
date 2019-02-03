class Stack {
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
        return this.items.pop();
    }

    peek() {
        if (this.items.length == 0)
            return null;
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length == 0;
    }
}

export default Stack;