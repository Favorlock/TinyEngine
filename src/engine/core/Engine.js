import ECS from "../ecs/ECS.js";
import FixedTimestep from "../tick/FixedTimestep.js";

class Engine {
    constructor(config = {}) {
        this.config = config;
        this.isInitialized = false;
        this.fps = 0;
    }

    init() {
        this.canvas = this.config.canvas || document.getElementById("viewport");
        this.ctx = this.config.ctx || this.canvas.getContext('2d');
        this.ecs = this.config.ecs || new ECS();
        this.tickHandler = this.config.tickHandler || new FixedTimestep(this.canvas);

        // Configure Canvas
        this.canvas.width = this.config.width || 1024;
        this.canvas.height = this.config.height || 768;

        // Configure 2D Context
        this.ctx.imageSmoothingEnabled = this.config.imageSmoothingEnabled || false;

        // Register Systems
        if (this.config.systems) {
            for (let i in this.config.systems) {
                this.ecs.addSystem(this.config.systems[i]);
            }
        }

        document.addEventListener('visibilitychange', function (e) {
            if (document.hidden) this.tickHandler.start.bind(this.tickHandler);
            else this.tickHandler.stop.bind(this.tickHandler)
        }.bind(this))

        this.isInitialized = true;
    }

    update(time, dt) {
        let s = performance.now();
        this.ecs.update(time, dt);
        let f = performance.now();
        this.fps = 1000 / (f - s);
    }

    start() {
        if (this.isInitialized) {
            this.tickHandler.add(this.update, this);
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