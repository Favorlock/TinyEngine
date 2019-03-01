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

class AIMovementSystem extends System {
    constructor() {
        super();
        this._skeleton = null;
    }

    set entity(skeleton) {
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
                    tran.pos_x += 2;
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
    assetManager.queueDownload('raptor.run', '../../assets/raptor/Run.png');
    assetManager.queueDownload('raptor.death', '../../assets/raptor/Death.png');
    assetManager.queueDownload('raptor.deploy_para', '../../assets/raptor/DeployParachute.png');
    assetManager.queueDownload('raptor.dive', '../../assets/raptor/Dive.png');
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
        let raptorRunFrames = ImageUtils.sliceImage(assetManager.cache['raptor.run'], 41, 47);
        let raptorDeathFrames = ImageUtils.sliceImage(assetManager.cache['raptor.death'], 38, 45);
        let raptorDeployParaFrames = ImageUtils.sliceImage(assetManager.cache['raptor.deploy_para'], 45, 88);
        let raptorDiveFrames = ImageUtils.sliceImage(assetManager.cache['raptor.dive'], 39, 48);

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

        let aiMovementSystem = new AIMovementSystem();
        ecs.addSystem(aiMovementSystem);

        let raptor;
        let trans;

        let interval = ctx.canvas.width / 6;
        let xOffset = -interval / 3;

        raptor = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 3 + 100,
            3, 3, 0);
        raptor.add(trans);
        raptor.add(new AnimatorComponent(new Animation(raptorDeathFrames, 100 / 1000, true)));

        ecs.addEntity(raptor);

        raptor = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 3 + 100,
            3, 3, 0);
        raptor.add(trans);
        raptor.add(new AnimatorComponent(new Animation(raptorDeployParaFrames, 100 / 1000, true)));

        ecs.addEntity(raptor);

        raptor = new Entity();
        trans = new TransformComponent((xOffset += interval),
            ctx.canvas.height / 3 + 100,
            3, 3, 0);
        raptor.add(trans);
        raptor.add(new AnimatorComponent(new Animation(raptorDiveFrames, 100 / 1000, true)));

        ecs.addEntity(raptor);
        //
        // raptor = new Entity();
        // trans = new TransformComponent((xOffset += interval),
        //     ctx.canvas.height / 3 + 100,
        //     3, 3, 0);
        // raptor.add(trans);
        // raptor.add(new AnimatorComponent(new Animation(skeletonHitFrames, 100 / 1000, true)));
        //
        // ecs.addEntity(raptor);
        //
        // raptor = new Entity();
        // trans = new TransformComponent((xOffset += interval),
        //     ctx.canvas.height / 3 + 100,
        //     3, 3, 0);
        // raptor.add(trans);
        // raptor.add(new AnimatorComponent(new Animation(skeletonDeathFrames, 100 / 1000, true)));
        //
        // ecs.addEntity(raptor);

        raptor = new Entity();
        trans = new TransformComponent(0,
            ctx.canvas.height / 4 * 3,
            3, 3, 0);
        raptor.add(trans);
        raptor.add(new AnimatorComponent(new Animation(raptorRunFrames, 100 / 1000, true)));

        ecs.addEntity(raptor);
        aiMovementSystem.entity = raptor;

        engine.start();
    });
};