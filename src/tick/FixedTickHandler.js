import TickHandler from "./TickHandler.js";

class FixedTickHandler extends TickHandler {
    constructor(canvas, tickLength = 1000 / 50) {
        super();
        this.canvas = canvas;
        this.tickLength = tickLength;
        this.lastTick = 0;
        this.isPlaying = false;
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
            this.lastTick += this.tickLength;
            super.queueUpdates(this.lastTick);
        }
    }
}

export default FixedTickHandler;