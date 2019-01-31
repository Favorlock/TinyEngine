import Engine from './engine/core/Engine.js';
import System from './engine/ecs/System.js';
import SemiFixedTimestep from './engine/tick/SemiFixedTimestep.js';
import AssetManager from './engine/assets/AssetManager.js'
import Component from "./engine/ecs/Component.js";
import Entity from "./engine/ecs/Entity.js";
import ECS from "./engine/ecs/ECS.js";

class TransformComponent extends Component {
    constructor(scale = 1, rotation = 0) {
        super();
        this.scale = scale;
        this.rotation = rotation;
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
    constructor(img, width, height, offsetX, offsetY) {
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
                this.ctx.drawImage(sprite.img, sprite.offsetX, sprite.offsetY, sprite.width, sprite.height,
                    pos.x, pos.y - sprite.height * tran.scale, sprite.width * tran.scale, sprite.height * tran.scale);
            }
        }
        this.ctx.restore();
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
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.ctx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.hue = (this.hue + dt / 20) % 360;
    }
}

let canvas = document.getElementById('viewport');
let ctx = canvas.getContext('2d');

window.onload = function () {
    let assetManager = new AssetManager();
    assetManager.queueDownload('./assets/SkeletonIdle.png');
    assetManager.downloadAll(function () {
        let width = 1024, height = 768;
        let ecs = new ECS();

        ecs.addSystem(new BackgroundRenderSystem(ctx));
        ecs.addSystem(new SpriteRenderSystem(ctx));

        let skeleton = new Entity();
        skeleton.add(new TransformComponent(1));
        skeleton.add(new PositionComponent(width / 2, height / 2));
        skeleton.add(new SpriteComponent(assetManager.cache['./assets/SkeletonIdle.png'], 24, 32, 0, 0));

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