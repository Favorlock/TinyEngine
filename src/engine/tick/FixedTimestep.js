import Timestep from "./Timestep.js";

class FixedTimestep extends Timestep {
    constructor(canvas, tickLength = 1000 / 50) {
        super();
        this.canvas = canvas;
        this.tickLength = tickLength;
        this.lastTick = 0;
    }

    dispatch(tFrame) {
        let nextTick = this.lastTick + this.tickLength;
        let numTicks = 0;

        if (tFrame > nextTick) {
            let timeSinceTick = tFrame - this.lastTick;
            numTicks = Math.floor(timeSinceTick / this.tickLength);
        }

        super.dispatch(numTicks);
    }

    queueUpdates(numTicks) {
        for (let i = 0; i < numTicks; i++) {
            let prev = this.lastTick;
            this.lastTick += this.tickLength;
            let dt = this.lastTick - prev;
            super.queueUpdates(this.lastTick, dt);
        }
    }
}

export default FixedTimestep;