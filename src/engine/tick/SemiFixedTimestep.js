import Timestep from "./Timestep.js";
import BrowserUtils from "../utils/BrowserUtils.js";

const dt = 10;

class SemiFixedTimestep extends Timestep {
    constructor(canvas, maxFrameTime = 1000 / 60) {
        super();
        this.canvas = canvas;
        this.maxFrameTime = maxFrameTime;
        this.time = 0;
        this.lastTime = 0;
        this.accumulator = 0;
    }

    start() {
        this.lastTime = this.now();
        super.start();
    }

    dispatch() {
        let newTime = this.now();
        let frameTime = newTime - this.lastTime;

        if (frameTime > this.maxFrameTime) {
            frameTime = this.maxFrameTime;
        }

        this.lastTime = newTime;
        this.accumulator += frameTime;

        while (this.accumulator >= dt) {
            super.queueUpdates(this.time, dt);
            this.accumulator -= this.maxFrameTime;
            this.time += this.maxFrameTime / 1000;
        }

        // TODO: Implement ECS system staging

        if (this.isPlaying) {
            this.requestId = BrowserUtils.requestAnimFrame(this.dispatch.bind(this), this.canvas);
        }
    }

    now() {
        return window.performance.now();
    }
}

export default SemiFixedTimestep;