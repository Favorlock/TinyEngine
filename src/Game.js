import Engine from './engine/core/Engine.js';
import System from './engine/ecs/System.js';
import SemiFixedTimestep from './engine/tick/SemiFixedTimestep.js';
import AssetManager from './engine/assets/AssetManager.js'
import Component from "./engine/ecs/Component.js";
import Entity from "./engine/ecs/Entity.js";
import ECS from "./engine/ecs/ECS.js";
import ImageUtils from "./engine/utils/ImageUtils.js";

class TransformComponent extends Component {
    constructor(scale = 1, rotation = 0) {
        super();
        this.scale = scale;
        this._rotation = rotation;
    }

    get rotation() {
        return this._rotation;
    }

    set rotation(rotation) {
        this._rotation = rotation % 360;
    }
}

class PositionComponent extends Component {
    constructor(x, y, zIndex = 0) {
        super();
        this.x = x;
        this.y = y;
        this.zIndex = zIndex;
    }
}

class SpriteComponent extends Component {
    constructor(img, width, height, offsetX = 0, offsetY = 0) {
        super();
        this.img = img;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

class SpriteRenderSystem extends System {
    constructor(ctx) {
        super();
        this.ctx = ctx;
    }

    update(entities, time, dt) {
        for (let node = entities; node; node = node.next) {
            let entity = node.data;
            let tran = entity.get(TransformComponent);
            let pos = entity.get(PositionComponent);
            let sprite = entity.get(SpriteComponent);

            if (tran && pos && sprite) {
                let xOffset = -sprite.width / 2;
                let yOffset = -sprite.height / 2;

                // Save previous transformation
                this.ctx.save();
                // Set new transformation
                this.ctx.resetTransform();
                this.ctx.translate(pos.x, pos.y);
                this.ctx.translate(xOffset, yOffset);
                this.ctx.rotate(tran.rotation * (Math.PI / 180));
                this.ctx.scale(tran.scale, tran.scale);

                // Draw sprite
                this.ctx.drawImage(sprite.img, sprite.offsetX, sprite.offsetY, sprite.width, sprite.height,
                    xOffset, yOffset, sprite.width, sprite.height);
                // Restore saved transform
                this.ctx.restore();
            }
        }
    }
}

class BackgroundRenderSystem extends System {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.hue = 0.0;
        this.saturation = 50;
        this.lightness = 50;
    }

    update(entities, time, dt) {
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.resetTransform();

        this.hue = (this.hue + dt / 20) % 360;
    }
}

class TweenSystem extends System {
    constructor() {
        super();
        this.rotationAmount = 2;
        this.scaleAmount = 0.25;
        this.scaleTime = 0;
        this.scaleTimeInterval = 0.05;
    }

    update(entities, time, dt) {
        for (let node = entities; node; node = node.next) {
            let entity = node.data;
            let tran = entity.get(TransformComponent);
            if (!tran) continue;
            tran.rotation += this.rotationAmount;
            tran.scale += Math.sin(this.scaleTime += this.scaleTimeInterval) * this.scaleAmount;
        }
    }
}

let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');

window.onload = function () {
    let assetManager = new AssetManager();
    assetManager.queueDownload('skeleton', './assets/SkeletonIdle.png');
    assetManager.downloadAll(function () {
        let width = 1024, height = 768;
        let ecs = new ECS();

        /*
        Takes a source image and slices it into an array of images.
        This is useful for sprite sheets that don't have any padding between frames.
        If you don't add a pixel of padding to sprite sheets it is possible that
        adjacent frames may bleed into the frame you are rendering when drawing
        from a single image using an offset.
         */
        let skeletonFrames = ImageUtils.sliceImage(assetManager.cache['skeleton'], 24, 32, 0, 0);

        // Register all systems in the order to be executed.
        ecs.addSystem(new TweenSystem());
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new SpriteRenderSystem(ctx));

        // Create a new entity container.
        let skeleton = new Entity();
        // Add components to the entity.
        skeleton.add(new TransformComponent(5, 90));
        skeleton.add(new PositionComponent(width / 2, height / 2));
        skeleton.add(new SpriteComponent(skeletonFrames[5], 24, 32));

        // Register the entity with the Entity Component System engine.
        ecs.addEntity(skeleton);

        let config = {
            canvas: canvas,
            ctx: ctx,
            width: width,
            height: height,
            tickHandler: new SemiFixedTimestep(canvas),
            ecs: ecs
        };

        let engine = new Engine(config);
        engine.init();
        engine.start();
    })
};