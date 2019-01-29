import EventListenerBinding from './EventListenerBinding.js';

class EventDispatch {
    constructor() {
        this.bindings = new Map();
    }

    add(listener) {
        if (!listener || typeof listener !== 'function') {
            return;
        }

        if (!this.bindings.has(listener)) {
            this.bindings.set(listener, new EventListenerBinding(listener));
        }
    }

    addOnce(listener) {
        if (!listener || typeof listener !== 'function') {
            return;
        }

        if (!this.bindings.has(listener)) {
            this.bindings.set(listener, new EventListenerBinding(listener, true));
        }
    }

    remove(listener) {
        if (!listener) {
            return;
        }

        this.bindings.delete(listener);
    }

    dispatch(args = []) {
        for (let [listener, binding] of this.bindings) {
            binding.emitEvent(args);

            if (binding.isOnce) {
                this.remove(listener);
            }
        }
    }
}

export default EventDispatch;