import Engine from './engine/core/Engine.js';
import System from './engine/ecs/System.js';
import SemiFixedTimestep from './engine/tick/SemiFixedTimestep.js';
import AssetManager from './engine/assets/AssetManager.js';
import Component from './engine/ecs/Component.js';
import Entity from './engine/ecs/Entity.js';
import ECS from './engine/ecs/ECS.js';
import ImageUtils from './engine/utils/ImageUtils.js';
import MathUtils from './engine/utils/MathUtils.js';
import InputManager from './engine/io/InputManager.js';
import QuadTree from "./engine/collections/QuadTree.js";
import Queue from "./engine/collections/Queue.js";

class TransformComponent extends Component {
    constructor(scale = 1, rotation = 0) {
        super();
        this.scale = scale;
        this.rotation = MathUtils.degreesToRadians(rotation);
        this.snapshot = {
            scale: scale,
            rotation: MathUtils.degreesToRadians(rotation)
        };

    }

    setRadianRotation(rotation) {
        this.rotation = rotation;
    }

    setDegreeRotation(rotation) {
        this.rotation = MathUtils.degreesToRadians(rotation);
    }

    save() {
        this.snapshot = {
            scale: this.scale,
            rotation: this.rotation
        };
    }

    restore() {
        Object.assign(this, this.snapshot);
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
    constructor(img) {
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
    constructor(ctx, engine) {
        super();
        this.ctx = ctx;
        this.engine = engine;
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
                this.ctx.translate(xOffset / 2, yOffset / 2);
                if (tran.rotation != 0) this.ctx.rotate(tran.rotation);
                if (tran.scale != 1) this.ctx.scale(tran.scale, tran.scale);

                // Draw sprite
                this.ctx.drawImage(sprite.img, sprite.offsetX, sprite.offsetY, sprite.width, sprite.height,
                    xOffset, yOffset, sprite.width, sprite.height);

                if (debug) {
                    this.ctx.strokeStyle = 'navy';
                    this.ctx.lineWidth = 0.25;
                    this.ctx.strokeRect(xOffset, yOffset, sprite.width, sprite.height);

                    this.ctx.fillStyle = 'green';
                    this.ctx.fillRect(0, 0, 1, 1);
                }

                // Restore saved transform
                this.ctx.restore();
            }
        }

        if (debug) {
            if (tree) {
                let mp = {
                    x: InputManager.getMouse('clientX') || width / 2,
                    y: InputManager.getMouse('clientY') || height / 2,
                    width: 5,
                    height: 5
                }
                let start = performance.now();
                let res = new Set(tree.retrieve(mp));
                let total = performance.now() - start;

                if (total > 0) {
                    // console.log(`time: ${total}`);
                }

                let nq = new Queue();
                let eq = new Queue();
                nq.push(tree.root);

                this.ctx.save();
                this.ctx.resetTransform();

                this.ctx.strokeStyle = 'red';

                while (!nq.isEmpty()) {
                    let node = nq.pop();

                    if (node._stuckChildren.length) {
                        eq.push(node._stuckChildren);
                    }

                    if (node.nodes.length) {
                        nq.push(node.nodes);
                    } else if (node.children.length) {
                        eq.push(node.children);
                    }

                    let bounds = node._bounds;
                    this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
                }

                this.ctx.strokeStyle = 'black';
                this.ctx.fillStyle = 'green';

                while (!eq.isEmpty()) {
                    let entity = eq.pop();

                    if (res.has(entity)) {
                        ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
                    } {
                        ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
                    }

                    // ctx.beginPath();
                    // ctx.arc(entity.x, entity.y, 5, 0, 2 * Math.PI);
                    // ctx.fill();
                }

                this.ctx.fillStyle = 'blue';
                this.ctx.fillRect(mp.x, mp.y, mp.width, mp.height);

                this.ctx.restore();
            }

            this.ctx.save();
            this.ctx.resetTransform();
            this.ctx.fillStyle = 'black';
            this.ctx.textBaseline = 'top';
            this.ctx.fillText('(0, 0)', 0, 0);

            this.ctx.fillStyle = 'black';
            this.ctx.textBaseline = 'bottom';
            this.ctx.textAlign = 'end';
            this.ctx.fillText(`(${this.ctx.canvas.width}, ${this.ctx.canvas.height})`, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.restore();
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
        this.ctx.save();
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.restore();

        this.hue = (this.hue + dt * (1 / dt)) % 360;
    }
}

class JumpSystem extends System {
    constructor() {
        super();
        this.scaleSeed = 0.25;
        this.stepMax = Math.PI / 60;
        this.stepMultiple = 2.5;
        this.stepMinBound = 0.8
    }

    update(entities, time, dt) {
        for (let node = entities; node; node = node.next) {
            let entity = node.data;
            let tran = entity.get(TransformComponent);
            let state = entity.get(StateComponent);
            if (tran && state && state.isJumping) {
                if (!state.jumpTime) {
                    tran.save();
                    state.jumpTime = 0;
                    state.jumpStep = Math.max(Math.random(), this.stepMinBound) * this.stepMultiple * this.stepMax;
                }

                tran.setRadianRotation(tran.rotation + state.jumpStep);
                state.jumpTime += state.jumpStep;

                tran.scale += (Math.sin(state.jumpTime) * this.scaleSeed) / (2 * Math.PI);
                if (state.jumpTime >= 2 * Math.PI) {
                    state.isJumping = false;

                    tran.restore();

                    delete state.jumpTime;
                    delete state.jumpStep;
                }
            }
        }
    }
}

class DebugSystem extends System {
    constructor() {
        super();
        this.dirty = false;
    }

    update() {
        if (InputManager.getKeyboard('`', 'win') && !this.dirty) {
            debug = !debug;
            this.dirty = true;
        } else if (!InputManager.getKeyboard('`', 'win') && this.dirty) {
            this.dirty = false;
        }
    }
}

let tree;
let last;
let debug = true;
let width, height;
let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');
InputManager.init(canvas);

window.onload = function () {
    let assetManager = new AssetManager();
    assetManager.queueDownload('skeleton.idle', './assets/SkeletonIdle.png');
    assetManager.queueDownload('skeleton.walk', './assets/SkeletonWalk.png');
    assetManager.downloadAll(function () {
        width = 1024;
        height = 768;
        let ecs = new ECS();

        tree = new QuadTree({
            x: 0,
            y: 0,
            width: width,
            height: height
        }, false, 5, 4);

        for (let i = 0; i < 100; i++) {
            last = {
                x: Math.round(Math.random() * width),
                y: Math.round(Math.random() * height),
                width: Math.round(Math.random() * 10 + 5),
                height: Math.round(Math.random() * 10 + 5),
            }
            tree.insert(last)
        }


        /*
        Takes a source image and slices it into an array of images.
        This is useful for sprite sheets that don't have any padding between frames.
        If you don't add a pixel of padding to sprite sheets it is possible that
        adjacent frames may bleed into the frame you are rendering when drawing
        from a single image using an offset.
         */
        let skeletonIdleFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.idle'], 24, 32);
        let skeletonWalkFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.walk'], 22, 33);

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

        // Register all systems in the order to be executed.
        ecs.addSystem(new DebugSystem())
        ecs.addSystem(new JumpSystem());
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new SpriteRenderSystem(ctx, engine));

        // for (let i = 0; i < 100; i++) {
        //     // Create a new entity container.
        //     let skeleton = new Entity();
        //     // Add components to the entity.
        //     skeleton.add(new TransformComponent(Math.max(Math.random(), 0.1) * 5, Math.random() * 360));
        //     skeleton.add(new PositionComponent(Math.floor(Math.random() * width), Math.floor(Math.random() * height)));
        //     skeleton.add(new SpriteComponent(skeletonWalkFrames[0], 22, 33));
        //     skeleton.add(new StateComponent({ isJumping: true }))
        //
        //     ecs.addEntity(skeleton);
        // }

        // // Create a new entity container.
        // let skeleton = new Entity();
        // // Add components to the entity.
        // skeleton.add(new TransformComponent(5, 0));
        // skeleton.add(new PositionComponent(width / 2, height / 2));
        // skeleton.add(new SpriteComponent(skeletonWalkFrames[0], 22, 33));
        // skeleton.add(new StateComponent({isJumping: true}));
        //
        // ecs.addEntity(skeleton);

        engine.start();
    });
};