import EventListenerBinding from './EventListenerBinding.js';

class EventDispatch {
    constructor() {
        this.bindings = new Map();
    }

    add(listener, ctx) {
        if (!listener || typeof listener !== 'function') {
            return;
        }

        if (!this.bindings.has(listener)) {
            this.bindings.set(listener, new EventListenerBinding(listener, ctx));
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

    dispatch() {
        for (let [listener, binding] of this.bindings) {
            binding.emitEvent.apply(binding, arguments);

            if (binding.isOnce) {
                this.remove(listener);
            }
        }
    }
}

export default EventDispatch;