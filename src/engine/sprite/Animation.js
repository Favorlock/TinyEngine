class Animation {
    constructor(frames, tpf, loop) {
        this.frames = frames;
        this.tpf = tpf;
        this.loop = loop;
        this.frameIndex = 0;
        this.ticks = 0;
        this.complete = false;
    }

    tick(ticks) {
        this.ticks += ticks;

        while (this.ticks >= this.tpf) {
            if (this.frameIndex === this.frames.length - 1)
                if (this.loop) {
                    this.frameIndex = 0;
                } else {
                    this.complete = true;
                }
            else
                this.frameIndex += 1;

            this.ticks = this.ticks - this.tpf;
        }
    }

    reset() {
        this.frameIndex = 0;
        this.complete = false;
    }

    getActiveFrame() {
        return this.frames[this.frameIndex];
    }
}

export default Animation;