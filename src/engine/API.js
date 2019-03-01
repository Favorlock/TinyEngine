import Engine from './core/Engine.js';
import ECS from './ecs/ECS.js';
import Entity from './ecs/Entity.js';
import Component from './ecs/Component.js';
import System from './ecs/System.js';
import * as Components from './core/Components.js';
import * as Systems from './core/Systems.js';
import InputManager from "./io/InputManager.js";
import EventDispatch from "./events/EventDispatch.js";
import EventListenerBinding from "./events/EventListenerBinding.js";
import FixedTimestep from "./tick/FixedTimestep.js";
import SemiFixedTimestep from "./tick/SemiFixedTimestep.js";
import Timestep from "./tick/Timestep.js";
import BrowserUtils from "./utils/BrowserUtils.js";
import ClassUtils from "./utils/ClassUtils.js";
import ImageUtils from "./utils/ImageUtils.js";
import MathUtils from "./utils/MathUtils.js";
import ObjectUtils from "./utils/ObjectUtils.js";
import DoublyLinkedList from "./collections/DoublyLinkedList.js";
import QuadTree from "./collections/QuadTree.js";
import Queue from "./collections/Queue.js";
import Stack from "./collections/Stack.js";
import TypeRegistry from "./serialization/TypeRegistry.js";
import AssetManager from "./assets/AssetManager.js";
import Animation from "./sprite/Animation.js";

const API = {
    Engine: Engine,
    InputManager: InputManager,
    EventDispatch: EventDispatch,
    EventListenerBinding: EventListenerBinding,
    Timestep: Timestep,
    FixedTimestep: FixedTimestep,
    SemiFixedTimestep: SemiFixedTimestep,
    ECS: ECS,
    Entity: Entity,
    Component: Component,
    System: System,
    Components: Components,
    Systems: Systems,
    BrowserUtils: BrowserUtils,
    ClassUtils: ClassUtils,
    ImageUtils: ImageUtils,
    MathUtils: MathUtils,
    ObjectUtils: ObjectUtils,
    DoublyLinkedList: DoublyLinkedList,
    QuadTree: QuadTree,
    Queue: Queue,
    Stack: Stack,
    TypeRegistry: TypeRegistry,
    AssetManager: AssetManager,
    Animation: Animation
}

export default API;