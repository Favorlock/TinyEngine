import Engine from './core/Engine.js';

window.onload = function () {
    let config = {
        width: 1024,
        height: 768,
    };

    let engine = new Engine(config);
    engine.init();
    engine.start();
    window.setTimeout(() => {
        engine.stop();
    }, 5000)
};