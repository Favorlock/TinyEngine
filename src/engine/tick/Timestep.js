import EventDispatch from "../events/EventDispatch.js";
import BrowserUtils from "../utils/BrowserUtils.js";

class Timestep extends EventDispatch {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.isPlaying = false;
    }

    start() {
        this.isPlaying = true;
        this.requestId = BrowserUtils.requestAnimFrame(this.dispatch.bind(this), this.canvas);
    }

    stop() {
        this.isPlaying = false;
        BrowserUtils.cancelAnimFrame(this.requestId);
    }

    dispatch() {
        this.queueUpdates.apply(this, arguments);

        if (this.isPlaying) {
            this.requestId = BrowserUtils.requestAnimFrame(this.dispatch.bind(this), this.canvas);
        }
    }

    queueUpdates() {
        super.dispatch.apply(this, arguments);
    }
}

export default Timestep