class System {
    constructor() {
        this._createdOn = window.performance.now();
    }

    update(entities, time, dt) {
        // To be overridden by system implementations
    }

    is(type) {
        return this instanceof type;
    }
}

export default System;