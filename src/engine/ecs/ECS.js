import Entity from './Entity.js';
import Component from './Component.js';
import System from './System.js';
import DoublyLinkedList from "../collections/DoublyLinkedList.js";

class ECS {
    constructor() {
        this.entities = new DoublyLinkedList();
        this.systems = new DoublyLinkedList();
        this.updating = false;
    }

    addSystem(system) {
        this.systems.addLast(system);
        this.systems.mergeSort(function (a, b) {
            return a._createdOn < b._createdOn;
        });
    }

    getSystem(type) {
        return this.systems.findOne(function (a) {
            return a.is(type);
        })
    }

    removeSystem(system) {
        this.systems.remove(system);
    }

    removeAllSystems() {
        this.systems.removeAll();
    }

    addEntity(entity) {
        this.entities.addLast(entity);
    }

    removeEntity(entity) {
        this.entities.remove(entity);
    }

    removeAllEntities() {
        this.entities.removeAll();
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

    update(time, dt) {
        this.updating = true;
        // TODO: System Updates
        for (let node = this.systems.head; node; node = node.next) {
            node.data.update(this.entities, time, dt)
        }
        this.updating = false;
    }
}

ECS.Entity = Entity;
ECS.Component = Component;
ECS.System = System;

export default ECS;