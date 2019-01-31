class Entity {
    constructor() {
        this.id = Entity._count++;
        this.components = {};
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
        };
    }
}

Entity._count = 0;

export default Entity;