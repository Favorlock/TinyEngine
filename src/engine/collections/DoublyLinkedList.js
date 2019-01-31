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

    findOne(matcher) {
        let tmp = this._head;
        while (tmp) {
            if (matcher(tmp._data)) break;
            tmp = tmp._next;
        }
        return tmp ? tmp._data : null;
    }

    empty() {
        this._head === null;
    }

    removeAll() {
        this._head = null;
        this._tail = null;
    }

    swap(first, second) {
        if (first._prev == second) {
            first._prev = second._prev;
            second._prev = first;
            second._next = first._next;
            first._next = second;
        } else if (second._prev == first) {
            second._prev = first._prev;
            first._prev = second;
            first._next = second._next;
            second._next = first;
        } else {
            let temp = first._prev;
            first._prev = second._prev;
            second._prev = temp;

            temp = first._next;
            first._next = second._next;
            second._next = temp;
        }

        if (this._head == first) this._head = second;
        else if (this._head == second) this._head = first;

        if (this._tail == first) this._tail = second;
        else if (this._tail == second) this._tail = first;

        if (first._prev) first._prev._next = first;
        if (second._prev) second._prev._next = second;
        if (first._next) first._next._prev = first;
        if (second._next) second._next._prev = second;
    }

    mergeSort(comparator) {
        if (this._head == this._tail) return;

        let lists = [], start = this._head, end;
        while (start) {
            end = start;
            while (end._next && comparator(end._data, end._next._data) <= 0) end = end._next;

            let next = end._next;
            start._prev = end._next = null;
            lists.push(start);
            start = next;
        }

        while (lists.length > 1) lists.push(this.merge(lists.shift(), lists.shift(), comparator));

        this._tail = this._head = lists[0];
        while (this._tail._next) this._tail = this._tail._next;
    }

    merge(head1, head2, comparator) {
        let node, head;
        if (comparator(head1._data, head2._data) <= 0) {
            head = node = head1;
            head1 = head1._next;
        } else {
            head = node = head2;
            head2 = head2._next;
        }

        while (head1 && head2) {
            if (comparator(head1._data, head2._data) <= 0) {
                node._next = head1;
                head1._prev = node;
                node = head1;
                head1 = head1._next;
            } else {
                node._next = head2;
                head2._prev = node;
                node = head2;
                head2 = head2._next;
            }
        }

        if (head1) {
            node._next = head1;
            head1._prev = node;
        } else {
            node._next = head2;
            head2._prev = node;
        }

        return head;
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
        return arr.toString();
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