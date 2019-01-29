class EventListenerBinding {
    constructor(listener, isOnce = false) {
        this.listener = listener;
        this.isOnce = isOnce;
    }

    emitEvent(args = []) {
        this.listener.call(this.listener, args);
    }
}

export default EventListenerBinding;