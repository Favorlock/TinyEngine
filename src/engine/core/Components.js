import Component from '../ecs/Component.js';
import MathUtils from '../utils/MathUtils.js';

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

class StateComponent extends Component {
    constructor(src = {}) {
        super();
        Object.assign(this, src);
    }
}

class ColliderComponent extends Component {
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export {TransformComponent, SpriteComponent, AnimatorComponent, ColliderComponent, StateComponent}