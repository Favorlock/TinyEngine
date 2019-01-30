import Entity from './Entity.js';
import Component from './Component.js';
import System from './System.js';

class ECS {
    constructor() {
        this.entities = [];
        this.systems = {};
        this.families = new Map();
        this.updating = false;
    }

    addSystem(key, system) {
        let value = this.systems[key]
        if (value === null || value === undefined) {
            this.systems[key] = system;
        }
    }

    removeSystem(key) {
        let value = this.systems[key];
        if (value !== null && value !== undefined) {
            delete this.systems[key];
        }
    }

    addEntity(entity) {
    }

    getEntityById(id) {
        for (let i = 0; i < this.entities.length; i++) {
            let entity = this.entities[i];
            if (entity.id === id) {
                return entity;
            }
        }

        return null;
    }

    removeEntity(entity) {
    }

    update(time, ds) {
        this.updating = true;
        // TODO: System Updates
        console.log(time);
        console.log(ds);
        this.updating = false;
    }
}

ECS.Entity = Entity;
ECS.Component = Component;
ECS.System = System;

export default ECS;