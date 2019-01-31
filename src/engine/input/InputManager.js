class InputManager {
    constructor(canvas) {
        console.log('New Input Manager')
        this.canvas = {
            keyboard: {},
            mouse: {},
            gamepad: {}
        }
        this.win = {
            keyboard: {},
            mouse: {},
            gamepad: {}
        }
        window.addEventListener('keydown', e => { this.win.keyboard[e.key] = 1 });
        window.addEventListener('keyup', e => { this.win.keyboard[e.key] = 0 });
        canvas.addEventListener('keydown', e => { this.win.keyboard[e.key] = 1 });
        canvas.addEventListener('keyup', e => { this.win.keyboard[e.key] = 0});
    }

    static get(key, element = 'canvas', device = 'keyboard') {
        let instance = InputManager.instance;
        if (!instance || !instance[element] || !instance[element][device]) return null;
        else return instance[element][device][key];
    }

    static getKeyboard(key, element = 'canvas') {
        return InputManager.get(key, element, 'keyboard');
    }

    static getMouse(key, element = 'canvas') {
        return InputManager.get(key, element, 'mouse');
    }

    static getGamepad(key, element = 'canvas') {
        return InputManager.get(key, element, 'gamepad');
    }

    static init(canvas) {
        if (InputManager.instance === undefined) InputManager.instance = new InputManager(canvas);
        return InputManager.instance;
    }
}

export default InputManager;