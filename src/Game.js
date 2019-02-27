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

class TransformComponent extends Component {
    /**
     * @constructor
     * @param pos_x (Number) [pos_x = 0] The starting position along the x axis;
     * @param pos_y (Number) [pos_y = 0] The starting position along the y axis;
     * @param scale_x (Number) [scale_x = 1] The starting scale along the x aaxis
     * @param scale_y (Number) [scale_y = 1] The starting scale along the y axis
     * @param angle (Number) [angle = 0] The starting rotation in radians
     */
    constructor(pos_x = 0, pos_y = 0, scale_x = 1, scale_y = 1, angle = 0) {
        super();
        this.pos_x = pos_x;
        this.pos_y = pos_y;
        this.scale_x = scale_x;
        this.scale_y = scale_y;
        this.angle = MathUtils.degreesToRadians(angle);
    }

    setRadianRotation(angle) {
        this.angle = angle;
    }

    setDegreeRotation(angle) {
        this.angle = MathUtils.degreesToRadians(angle);
    }

    save() {
        this.snapshot = {
            pos_x: this.pos_x,
            pos_y: this.pos_y,
            scale_x: this.scale_x,
            scale_y: this.scale_y,
            angle: this.angle
        };
    }

    restore() {
        Object.assign(this, this.snapshot);
    }
}

class SpriteComponent extends Component {
    constructor(img, width = img.width, height = img.height, offsetX = 0, offsetY = 0) {
        super();
        this.img = img;
        this.width = width;
        this.height = height;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }
}

class AnimatorComponent extends Component {
    constructor(animation) {
        super();
        this.animation = animation;
    }

    setAnimation(src) {
        this.animation = src;
        this.animation.reset();
    }
}

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

class StateComponent extends Component {
    constructor(src) {
        super();
        Object.assign(this, src);
    }
}

class Collider {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class CollisionSystem extends System {
    constructor(ctx) {
        super();
        this.candidates = [];
    }

    onEntityAdded(entity) {
        let collider = entity.get(Collider);
        if (collider) this.candidates.push(entity);
    }

    update(entities, time, dt) {
        let count = 0;
        for (let i = 0; i < this.candidates.length; i++) {
            let outer = this.candidates[i];
            for (let j = i + 1; j < this.candidates.length; j++) {
                let inner = this.candidates[j];
                if (this.didCollide(outer.get(Collider), inner.get(Collider))) {
                    count += 1;
                }
            }
        }
    }

    didCollide(fColl, sCall) {
        if (
            sCall.x + sCall.width < fColl.x ||
            sCall.x > fColl.x + fColl.width ||
            sCall.y + sCall.height < fColl.y ||
            sCall.y > fColl.y + fColl.height
        ) return false;

        return true;
    }
}

class AnimationSystem extends System {
    constructor() {
        super();
    }

    update(entities, time, dt) {
        for (let node = entities; node; node = node.next) {
            let entity = node.data;
            let animator = entity.get(AnimatorComponent);

            if (animator) {
                let anim = animator.animation;
                if (anim) anim.tick(dt);
            }
        }
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
            let sprite = entity.get(SpriteComponent);
            let animator = entity.get(AnimatorComponent);

            if (tran && (sprite || animator)) {
                let frame;

                if (animator && animator.animation) {
                    let anim = animator.animation;
                    frame = anim.getActiveFrame();
                } else if (sprite.img) {
                    frame = sprite.img;
                } else {
                    continue;
                }

                let width = frame.width;
                let height = frame.height;
                let xOffset = 0;
                let yOffset = -height;

                // Save previous transformation
                this.ctx.save();
                // Set new transformation
                this.ctx.resetTransform();
                this.ctx.translate(tran.pos_x, tran.pos_y);
                if (tran.angle != 0) this.ctx.rotate(tran.angle);
                if (tran.scale_x != 1 || tran.scale_y != 1) this.ctx.scale(tran.scale_x, tran.scale_y);

                // Draw sprite
                this.ctx.drawImage(frame, 0, 0, width, height,
                    xOffset, yOffset, width, height);

                if (debug) {
                    this.ctx.strokeStyle = 'navy';
                    this.ctx.lineWidth = 0.25;
                    this.ctx.strokeRect(xOffset, yOffset, width, height);

                    this.ctx.fillStyle = 'green';
                    this.ctx.fillRect(width / 2, -height / 2, 1, 1);
                }

                // Restore saved transform
                this.ctx.restore();
            }
        }

        if (debug) {
            ctx.save();
            ctx.resetTransform();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, ctx.canvas.height / 2);
            ctx.lineTo(ctx.canvas.width, ctx.canvas.height / 2);
            ctx.stroke();
            ctx.restore();
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

        // this.ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillStyle = 'black'
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.restore();

        // this.hue = (this.hue + dt * (1 / dt)) % 360;
    }
}

class JumpSystem extends System {
    constructor() {
        super();
        this.scaleSeed = 0.25;
        this.stepMax = Math.PI / 60;
        this.stepMultiple = 2.5;
        this.stepMinBound = 0.8;
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

                tran.setRadianRotation(tran.angle + state.jumpStep);
                state.jumpTime += state.jumpStep;

                let scale = (Math.sin(state.jumpTime) * this.scaleSeed) / (2 * Math.PI);
                tran.scale_x += scale;
                tran.scale_y += scale;
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

let debug = false;
let width, height;
let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');
InputManager.init(canvas);

window.onload = function () {
    let assetManager = new AssetManager();
    assetManager.queueDownload('skeleton.idle', './assets/SkeletonIdle.png');
    assetManager.queueDownload('skeleton.walk', './assets/SkeletonWalk.png');
    assetManager.queueDownload('skeleton.attack', './assets/SkeletonAttack.png');
    assetManager.queueDownload('skeleton.death', './assets/SkeletonDeath.png');
    assetManager.downloadAll(function () {
        width = 1024;
        height = 768;
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
        let skeletonAttackFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.attack'], 43, 37);
        let skeletonDeathFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.death'], 33, 32);

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
        ecs.addSystem(new DebugSystem());
        // ecs.addSystem(new JumpSystem());
        ecs.addSystem(new CollisionSystem(ctx, canvas.width, canvas.height));
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new SpriteRenderSystem(ctx, engine));
        ecs.addSystem(new AnimationSystem());

        let skeleton;
        let trans;

        // for (let i = 0; i < 100; i++) {
        //     // Create a new entity container.
        //     let skeleton = new Entity();
        //     let scale = Math.max(Math.random(), 0.1) * 5;
        //     let trans = new TransformComponent(
        //         Math.floor(Math.random() * width),
        //         Math.floor(Math.random() * height),
        //         scale,
        //         scale,
        //         Math.random() * 360);
        //     // Add components to the entity.
        //     skeleton.add(trans);
        //     skeleton.add(new SpriteComponent(skeletonWalkFrames[0], 22, 33));
        //     skeleton.add(new Collider(trans.pos_x, trans.pos_y, 22 * trans.scale_x, 33 * trans.scale_y))
        //     skeleton.add(new StateComponent({isJumping: true}))
        //
        //     ecs.addEntity(skeleton);
        // }

        let interval = ctx.canvas.width / 5;
        let xOffset = 0;

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 2,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonIdleFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 2,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonWalkFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 2,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonAttackFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 2,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonDeathFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        engine.start();
    });
};