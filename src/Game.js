import Engine from './engine/core/Engine.js';
import System from './engine/ecs/System.js';
import SemiFixedTimestep from './engine/tick/SemiFixedTimestep.js';
import AssetManager from './engine/assets/AssetManager.js'
import Component from "./engine/ecs/Component.js";
import Entity from "./engine/ecs/Entity.js";
import ECS from "./engine/ecs/ECS.js";
import ImageUtils from "./engine/utils/ImageUtils.js";
import MathUtil from "./engine/utils/MathUtil.js";

class TransformComponent extends Component {
    constructor(scale = 1, rotation = 0) {
        super();
        this.scale = scale;
        this.rotation = MathUtil.degreesToRadians(rotation);
    }

    setRadianRotation(rotation) {
        this.rotation = rotation;
    }

    setDegreeRotation(rotation) {
        this.rotation = MathUtil.degreesToRadians(rotation);
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

class StateComponent extends Component {
    constructor(src) {
        super();
        Object.assign(this, src);
    }
}

class AnimatorComponent extends Component {
    constructor(animations) {
        super();
        this.state = {};
        this.animations = animations;
    }
}

class SpriteSheet {
    constructor(img, ) {
        this.img = img;
    }
}

class Animation {
    constructor(src, ticksPerFrame, frames) {
        this.src = src;
        this.ticksPerFrame = ticksPerFrame;
        this.frames = frames;
    }
}

class AnimationFrame {
    constructor(xOffset, yOffset, width, height) {
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.width = width;
        this.height = height;
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
                this.ctx.rotate(tran.rotation);
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

class JumpSystem extends System {
    constructor() {
        super();
        this.scaleAmount = 0.25;
        this.stepMax = Math.PI / 60;
    }

    update(entities, time, dt) {
        for (let node = entities; node; node = node.next) {
            let entity = node.data;
            let tran = entity.get(TransformComponent);
            let state = entity.get(StateComponent);
            if (tran && state && state.isJumping) {
                if (!state.transformSnapshot) {
                    state.transformSnapshot = Object.assign({}, tran);
                    state.airTime = 0;
                    state.airStep = Math.max(Math.random(), 0.1) * this.stepMax;
                }

                tran.setRadianRotation(tran.rotation + state.airStep);
                state.airTime += state.airStep;

                tran.scale += (Math.sin(state.airTime) * this.scaleAmount) / (2 * Math.PI);
                if (state.airTime >= 2 * Math.PI) {
                    state.isJumping = false;

                    Object.assign(tran, state.transformSnapshot);

                    delete state.transformSnapshot;
                    delete state.airTime;
                    delete state.airStep;
                }
            }
        }
    }
}

let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');

window.onload = function () {
    let assetManager = new AssetManager();
    assetManager.queueDownload('skeleton.idle', './assets/SkeletonIdle.png');
    assetManager.queueDownload('skeleton.walk', './assets/SkeletonWalk.png');
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
        let skeletonIdleFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.idle'], 24, 32);
        let skeletonWalkFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.walk'], 22, 33);

        // Register all systems in the order to be executed.
        ecs.addSystem(new JumpSystem());
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new SpriteRenderSystem(ctx));

        for (let i = 0; i < 100; i++) {
            // Create a new entity container.
            let skeleton = new Entity();
            // Add components to the entity.
            skeleton.add(new TransformComponent(Math.max(Math.random(), 0.1) * 5, Math.random() * 360));
            skeleton.add(new PositionComponent(Math.floor(Math.random() * width), Math.floor(Math.random() * height)));
            skeleton.add(new SpriteComponent(skeletonWalkFrames[0], 24, 32));
            skeleton.add(new StateComponent({ isJumping: true }))

            ecs.addEntity(skeleton);
        }

        let config = {
            canvas: canvas,
            ctx: ctx,
            width: width,
            height: height,
            tickHandler: new SemiFixedTimestep(canvas),
            ecs: ecs
        };

        // Show the canvas when ready
        canvas.style.display = 'inline';

        // Start the game
        let engine = new Engine(config);
        engine.init();
        engine.start();
    })
};