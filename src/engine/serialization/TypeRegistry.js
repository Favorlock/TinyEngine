class TypeRegistry {
    constructor() {
        this.types = new Map();
    }

    isRegistered(type) {
        return this.types.has(type.name);
    }

    register(type) {
        if (this.isRegistered(type)) {
            return false;
        }

        this.types.set(type.name, type);
        return true;
    }

    get(name) {
        return this.types.get(name);
    }
}

export default TypeRegistry;