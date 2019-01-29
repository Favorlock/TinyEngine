class Entity {
    constructor() {
        this.id = Entity.count++;
        this.components = {};
    }

    add(component) {

    }

    toJSON() {
        return {
            components: this.components
        }
    }
}

Entity.count = 0;

export default Entity;