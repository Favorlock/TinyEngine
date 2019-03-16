class InputManager {
    constructor(canvas) {
        this.keyboard = {};
        this.mouse = {};
        this.gamepad = {};

        canvas.addEventListener('keydown', e => {
            InputManager.set(e.key, 1);
        }, false);
        canvas.addEventListener('keyup', e => {
            InputManager.clear(e.key)
        });
        canvas.addEventListener('mousemove', e => {
            this.mouse.clientX = e.clientX;
            this.mouse.clientY = e.clientY;
        }, false);
    }

    static set(key, value, device = 'keyboard') {
        let instance = InputManager.instance;
        if (!instance || !instance[device]) return null;
        instance[device][key] = value;
    }

    static get(key, device = 'keyboard') {
        let instance = InputManager.instance;
        if (!instance || !instance[device]) return null;
        return instance[device][key];
    }

    static clear(key, device = 'keyboard') {
        let instance = InputManager.instance;
        if (!instance  || !instance[device]) return null;
        InputManager.set(key, 0);
    }

    static getKeyboard(key) {
        return InputManager.get(key, 'keyboard');
    }

    static getMouse(key) {
        return InputManager.get(key, 'mouse');
    }

    static getGamepad(key) {
        return InputManager.get(key, 'gamepad');
    }

    static init(canvas) {
        if (InputManager.instance === undefined) InputManager.instance = new InputManager(canvas);
        return InputManager.instance;
    }
}

export default InputManager;