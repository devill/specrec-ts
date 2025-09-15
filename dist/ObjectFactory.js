"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistered = exports.register = exports.clearAll = exports.clear = exports.setAlways = exports.setOne = exports.create = exports.ObjectFactory = void 0;
exports.getInstance = getInstance;
class ObjectFactory {
    constructor() {
        this.queuedObjects = new Map();
        this.alwaysObjects = new Map();
        this.registeredObjects = new Map();
        this.registeredIds = new Map();
        this.autoIdCounter = 1;
    }
    create(ctor) {
        return (...args) => {
            const queued = this.queuedObjects.get(ctor);
            if (queued && queued.length > 0) {
                return queued.shift();
            }
            if (this.alwaysObjects.has(ctor)) {
                return this.alwaysObjects.get(ctor);
            }
            const instance = new ctor(...args);
            if (this.implementsConstructorTracking(instance)) {
                instance.constructorCalledWith(this.extractParameterInfo(args));
            }
            return instance;
        };
    }
    setOne(ctor, instance) {
        if (!this.queuedObjects.has(ctor)) {
            this.queuedObjects.set(ctor, []);
        }
        this.queuedObjects.get(ctor).push(instance);
    }
    setAlways(ctor, instance) {
        this.alwaysObjects.set(ctor, instance);
    }
    clear(ctor) {
        if (ctor) {
            this.queuedObjects.delete(ctor);
            this.alwaysObjects.delete(ctor);
        }
    }
    clearAll() {
        this.queuedObjects.clear();
        this.alwaysObjects.clear();
        this.registeredObjects.clear();
        this.registeredIds.clear();
        this.autoIdCounter = 1;
    }
    register(obj, id) {
        const objectId = id || `auto_${this.autoIdCounter++}`;
        if (this.registeredIds.has(obj)) {
            const existingId = this.registeredIds.get(obj);
            if (id && existingId !== id) {
                this.registeredObjects.delete(existingId);
                this.registeredIds.set(obj, objectId);
                this.registeredObjects.set(objectId, obj);
            }
            return existingId;
        }
        this.registeredObjects.set(objectId, obj);
        this.registeredIds.set(obj, objectId);
        return objectId;
    }
    getRegistered(id) {
        return this.registeredObjects.get(id);
    }
    getRegisteredId(obj) {
        return this.registeredIds.get(obj);
    }
    implementsConstructorTracking(obj) {
        return typeof obj?.constructorCalledWith === 'function';
    }
    extractParameterInfo(args) {
        return args.map((value, index) => ({
            index,
            type: typeof value,
            value
        }));
    }
}
exports.ObjectFactory = ObjectFactory;
let globalInstance;
function getInstance() {
    if (!globalInstance) {
        globalInstance = new ObjectFactory();
    }
    return globalInstance;
}
const create = (ctor) => getInstance().create(ctor);
exports.create = create;
const setOne = (ctor, instance) => getInstance().setOne(ctor, instance);
exports.setOne = setOne;
const setAlways = (ctor, instance) => getInstance().setAlways(ctor, instance);
exports.setAlways = setAlways;
const clear = (ctor) => getInstance().clear(ctor);
exports.clear = clear;
const clearAll = () => getInstance().clearAll();
exports.clearAll = clearAll;
const register = (obj, id) => getInstance().register(obj, id);
exports.register = register;
const getRegistered = (id) => getInstance().getRegistered(id);
exports.getRegistered = getRegistered;
//# sourceMappingURL=ObjectFactory.js.map