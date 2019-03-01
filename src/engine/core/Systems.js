import System from "../ecs/System.js";
import {
    TransformComponent,
    SpriteComponent,
    AnimatorComponent,
    ColliderComponent,
} from './Components.js';

class CollisionSystem extends System {
    constructor() {
        super();
        this.candidates = [];
    }

    onEntityAdded(entity) {
        let collider = entity.get(ColliderComponent);
        if (collider) this.candidates.push(entity);
    }

    update(entities, time, dt) {
        let count = 0;
        for (let i = 0; i < this.candidates.length; i++) {
            let outer = this.candidates[i];
            for (let j = i + 1; j < this.candidates.length; j++) {
                let inner = this.candidates[j];
                if (this.didCollide(outer.get(ColliderComponent), inner.get(ColliderComponent))) {
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

                if (this.engine.debug) {
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
    }
}

export {CollisionSystem, AnimationSystem, SpriteRenderSystem}