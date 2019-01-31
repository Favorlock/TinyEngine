import Engine from './engine/core/Engine.js';
import System from "./engine/ecs/System.js";
import SemiFixedTimestep from "./engine/tick/SemiFixedTimestep.js";

class BackgroundRenderSystem extends System {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.hue = 0.0;
        this.saturation = 50;
        this.lightness = 50;
    }

    update(entities, time, dt) {
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.hue = (this.hue + dt / 20) % 360;

        this.ctx.restore();
    }
}

let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');

window.onload = function () {
    let config = {
        canvas: canvas,
        ctx: ctx,
        width: 1024,
        height: 768,
        tickHandler: new SemiFixedTimestep(canvas),
        systems: [
            new BackgroundRenderSystem(ctx)
        ]
    };

    let engine = new Engine(config);
    engine.init();
    engine.start();
};