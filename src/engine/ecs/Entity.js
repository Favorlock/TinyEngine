class Entity {
    constructor() {
        this.id = Entity.count();
        this.components = {}
    }

    add(component) {
        this.components[component.constructor.name] = component;
    }

    get(type) {
        return this.components[type.name];
    }

    remove(component) {
        this.components[component.constructor.name] = null;
    }

    toJSON() {
        return {
            components: this.components
        }
    }
}

Entity._count = 0;
Entity.count = function () {
    return Entity.count += 1;
}

export default Entity;