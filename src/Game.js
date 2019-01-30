import Engine from './engine/core/Engine.js';
import TypeRegistry from "./engine/serialization/TypeRegistry.js";
import ClassUtils from "./engine/utils/ClassUtils.js";

let registry = new TypeRegistry();

class Foo {
    constructor() {
        this.foo = 'foo';
    }
}

class Bar extends Foo {
    constructor() {
        super();
        this.bar = 'bar';
    }
}

function fromJSON(json, type) {
    console.log(type.name);
    return Object.setPrototypeOf(JSON.parse(json), type.prototype);
}

console.log(registry.isRegistered(Foo));
console.log(registry.register(Foo));
console.log(registry.isRegistered(Bar));
console.log(registry.register(Bar));

let foobar = fromJSON(JSON.stringify(new Bar()), registry.get('Bar'))
console.log(foobar);
console.log(ClassUtils.getClassNames(foobar));

window.onload = function () {
    let config = {
        width: 1024,
        height: 768,
    };

    let engine = new Engine(config);
    engine.init();
    // engine.start();
    window.setTimeout(() => {
        engine.stop();
    }, 5000)
};