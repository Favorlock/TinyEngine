import EventDispatch from "../events/EventDispatch.js";
import BrowserUtils from "../utils/BrowserUtils.js";

class TickHandler extends EventDispatch {
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

    dispatch(args) {
        this.queueUpdates(args);

        if (this.isPlaying) {
            this.requestId = BrowserUtils.requestAnimFrame(this.dispatch.bind(this), this.canvas);
        }
    }

    queueUpdates(args) {
        super.dispatch(args);
    }
}

export default TickHandler