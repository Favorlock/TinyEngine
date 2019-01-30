class EventListenerBinding {
    constructor(listener, ctx, isOnce = false) {
        this.listener = listener;
        this.ctx = ctx;
        this.isOnce = isOnce;
    }

    emitEvent() {
        this.listener.apply(this.ctx, arguments);
    }
}

export default EventListenerBinding;