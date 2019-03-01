import API from '../engine/API.js';

let Entity = API.Entity;
let System = API.System;
let TransformComponent = API.Components.TransformComponent;
let AnimatorComponent = API.Components.AnimatorComponent;
let Animation = API.Animation;
let ImageUtils = API.ImageUtils;

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

class SkeletonAISystem extends System {
    constructor() {
        super();
        this._skeleton = null;
    }

    set skeleton(skeleton) {
        this._skeleton = skeleton;
    }

    update(entities, time, dt) {
        if (this._skeleton) {
            let tran = this._skeleton.get(TransformComponent);
            let anim = this._skeleton.get(AnimatorComponent);
            if (tran) {
                if (tran.pos_x > ctx.canvas.width) {
                    tran.pos_x = -anim.animation.frames.width * tran.scale_x
                } else {
                    tran.pos_x += 1;
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
        if (API.InputManager.getKeyboard('`', 'win') && !this.dirty) {
            engine.debug = !engine.debug;
            this.dirty = true;
        } else if (!API.InputManager.getKeyboard('`', 'win') && this.dirty) {
            this.dirty = false;
        }
    }
}

let width, height;
let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');
let engine;
API.InputManager.init(canvas);

window.onload = function () {
    let assetManager = new API.AssetManager();
    assetManager.queueDownload('skeleton.idle', '../../assets/SkeletonIdle.png');
    assetManager.queueDownload('skeleton.walk', '../../assets/SkeletonWalk.png');
    assetManager.queueDownload('skeleton.react', '../../assets/SkeletonReact.png');
    assetManager.queueDownload('skeleton.attack', '../../assets/SkeletonAttack.png');
    assetManager.queueDownload('skeleton.hit', '../../assets/SkeletonHit.png');
    assetManager.queueDownload('skeleton.death', '../../assets/SkeletonDeath.png');
    assetManager.downloadAll(function () {
        width = 1024;
        height = 768;
        let ecs = new API.ECS();

        /*
        Takes a source image and slices it into an array of images.
        This is useful for sprite sheets that don't have any padding between frames.
        If you don't add a pixel of padding to sprite sheets it is possible that
        adjacent frames may bleed into the frame you are rendering when drawing
        from a single image using an offset.
         */
        let skeletonIdleFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.idle'], 24, 32);
        let skeletonWalkFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.walk'], 22, 33);
        let skeletonReactFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.react'], 22, 32);
        let skeletonAttackFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.attack'], 43, 37);
        let skeletonHitFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.hit'], 30, 32);
        let skeletonDeathFrames = ImageUtils.sliceImage(assetManager.cache['skeleton.death'], 33, 32);

        let config = {
            canvas: canvas,
            ctx: ctx,
            width: width,
            height: height,
            tickHandler: new API.SemiFixedTimestep(canvas),
            ecs: ecs
        };

        // Show the canvas when ready
        canvas.style.display = 'inline';

        // Start the game
        engine = new API.Engine(config);
        engine.init();

        // Register all systems in the order to be executed.
        ecs.addSystem(new DebugSystem());
        // ecs.addSystem(new JumpSystem());
        ecs.addSystem(new API.Systems.CollisionSystem());
        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new API.Systems.SpriteRenderSystem(ctx, engine));
        ecs.addSystem(new API.Systems.AnimationSystem());

        let skeletonAISystem = new SkeletonAISystem();
        ecs.addSystem(skeletonAISystem);

        let skeleton;
        let trans;

        let interval = ctx.canvas.width / 6;
        let xOffset = -interval / 3;

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 4,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonIdleFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 4,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonReactFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 4,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonAttackFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 4,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonHitFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 4,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonDeathFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);

        skeleton = new Entity();
        trans = new TransformComponent(0,
            ctx.canvas.height / 4 * 3,
            3, 3, 0);
        skeleton.add(trans);
        skeleton.add(new AnimatorComponent(new Animation(skeletonWalkFrames, 100 / 1000, true)));

        ecs.addEntity(skeleton);
        skeletonAISystem.skeleton = skeleton;

        engine.start();
    });
};