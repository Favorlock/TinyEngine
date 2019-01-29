import ECS from "../ecs/ECS.js";
import FixedTickHandler from "../tick/FixedTickHandler.js";

class Engine {
    constructor(config = {}) {
        this.config = config;
        this.isInitialized = false;
    }

    init() {
        this.canvas = this.config.canvas || document.getElementById("viewport");
        this.ctx = this.canvas.getContext('2d');
        this.ecs = this.config.ecs || new ECS();
        this.tickHandler = new FixedTickHandler(this.canvas);

        // Configure Canvas
        this.canvas.width = this.config.width || 1024;
        this.canvas.height = this.config.height || 768;

        // Configure 2D Context
        this.ctx.imageSmoothingEnabled = this.config.imageSmoothingEnabled || false;

        this.isInitialized = true;
    }

    start() {
        if (this.isInitialized) {
            this.tickHandler.add(this.ecs.update);
            this.tickHandler.start();
        }
    }

    stop() {
        if (this.tickHandler.isPlaying) {
            this.tickHandler.stop();
        }
    }
}

export default Engine;