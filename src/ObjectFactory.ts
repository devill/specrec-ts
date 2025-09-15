export interface ConstructorParameterInfo {
  index: number;
  type: string;
  value: any;
}

export interface IConstructorCalledWith {
  constructorCalledWith(params: ConstructorParameterInfo[]): void;
}

type Constructor<T = {}> = new (...args: any[]) => T;

export class ObjectFactory {
  private queuedObjects = new Map<Function, any[]>();
  private alwaysObjects = new Map<Function, any>();
  private registeredObjects = new Map<string, any>();
  private registeredIds = new Map<any, string>();
  private autoIdCounter = 1;

  create<T>(ctor: Constructor<T>): (...args: ConstructorParameters<Constructor<T>>) => T {
    return (...args: ConstructorParameters<Constructor<T>>): T => {
      const queued = this.queuedObjects.get(ctor);
      if (queued && queued.length > 0) {
        return queued.shift() as T;
      }

      if (this.alwaysObjects.has(ctor)) {
        return this.alwaysObjects.get(ctor) as T;
      }

      const instance = new ctor(...args);

      if (this.implementsConstructorTracking(instance)) {
        instance.constructorCalledWith(this.extractParameterInfo(args));
      }

      return instance;
    };
  }

  setOne<T>(ctor: Constructor<T>, instance: T): void {
    if (!this.queuedObjects.has(ctor)) {
      this.queuedObjects.set(ctor, []);
    }
    this.queuedObjects.get(ctor)!.push(instance);
  }

  setAlways<T>(ctor: Constructor<T>, instance: T): void {
    this.alwaysObjects.set(ctor, instance);
  }

  clear(ctor?: Constructor): void {
    if (ctor) {
      this.queuedObjects.delete(ctor);
      this.alwaysObjects.delete(ctor);
    }
  }

  clearAll(): void {
    this.queuedObjects.clear();
    this.alwaysObjects.clear();
    this.registeredObjects.clear();
    this.registeredIds.clear();
    this.autoIdCounter = 1;
  }

  register(obj: any, id?: string): string {
    const objectId = id || `auto_${this.autoIdCounter++}`;

    if (this.registeredIds.has(obj)) {
      const existingId = this.registeredIds.get(obj)!;
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

  getRegistered<T>(id: string): T | undefined {
    return this.registeredObjects.get(id) as T | undefined;
  }

  getRegisteredId(obj: any): string | undefined {
    return this.registeredIds.get(obj);
  }

  private implementsConstructorTracking(obj: any): obj is IConstructorCalledWith {
    return typeof obj?.constructorCalledWith === 'function';
  }

  private extractParameterInfo(args: any[]): ConstructorParameterInfo[] {
    return args.map((value, index) => ({
      index,
      type: typeof value,
      value
    }));
  }
}

let globalInstance: ObjectFactory | undefined;

export function getInstance(): ObjectFactory {
  if (!globalInstance) {
    globalInstance = new ObjectFactory();
  }
  return globalInstance;
}

export const create = <T>(ctor: Constructor<T>) => getInstance().create(ctor);
export const setOne = <T>(ctor: Constructor<T>, instance: T) => getInstance().setOne(ctor, instance);
export const setAlways = <T>(ctor: Constructor<T>, instance: T) => getInstance().setAlways(ctor, instance);
export const clear = (ctor?: Constructor) => getInstance().clear(ctor);
export const clearAll = () => getInstance().clearAll();
export const register = (obj: any, id?: string) => getInstance().register(obj, id);
export const getRegistered = <T>(id: string) => getInstance().getRegistered<T>(id);