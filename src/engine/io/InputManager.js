class InputManager {
    constructor(canvas) {
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
        window.addEventListener('mousemove', e => {
            this.win.mouse.clientX = e.clientX;
            this.win.mouse.clientY = e.clientY;
        })
        canvas.addEventListener('keydown', e => { this.win.keyboard[e.key] = 1 });
        canvas.addEventListener('keyup', e => { this.win.keyboard[e.key] = 0});
        canvas.addEventListener('mousemove', e => {
            this.canvas.mouse.clientX = e.clientX;
            this.canvas.mouse.clientY = e.clientY;
        })
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