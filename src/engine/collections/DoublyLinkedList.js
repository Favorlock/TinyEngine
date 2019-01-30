class DoublyLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    add(data) {
        if (this.head == null) {
            this.head = new Node(data);
            this.tail = this.head;
        } else {
            let temp = this.tail;
            this.tail = new Node(data, temp);
            temp.next = this.tail;
        }
    }
}

class Node {
    constructor(data, next, prev) {
        this.data = data;
        this._next = next;
        this._prev = prev;
    }


    get next() {
        return this._next;
    }

    get prev() {
        return this._prev;
    }
}

export default DoublyLinkedList;