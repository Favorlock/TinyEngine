import Timestep from "./Timestep.js";
import BrowserUtils from "../utils/BrowserUtils.js";

class SemiFixedTimestep extends Timestep {
    constructor(canvas, maxFrameTime = 1 / 60) {
        super();
        this.canvas = canvas;
        this.maxFrameTime = maxFrameTime;
        this.time = 0;
        this.lastTime = 0;
        this.accumulator = 0;
    }

    start() {
        this.lastTime = performance.now();
        super.start();
    }

    dispatch(tFrame) {
        let frameTime = (tFrame - this.lastTime) / 1000;
        this.lastTime = tFrame;

        if (frameTime > this.maxFrameTime) {
            frameTime = this.maxFrameTime;
        }

        this.accumulator += frameTime;

        while (this.accumulator >= this.maxFrameTime) {
            super.queueUpdates(this.time, frameTime);
            this.accumulator -= this.maxFrameTime;
            this.time += this.maxFrameTime;
        }

        // TODO: Implement ECS system staging

        if (this.isPlaying) {
            this.requestId = BrowserUtils.requestAnimFrame(this.dispatch.bind(this), this.canvas);
        }
    }
}

export default SemiFixedTimestep;