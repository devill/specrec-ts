export interface ConstructorParameterInfo {
    index: number;
    type: string;
    value: any;
}
export interface IConstructorCalledWith {
    constructorCalledWith(params: ConstructorParameterInfo[]): void;
}
type Constructor<T = {}> = new (...args: any[]) => T;
export declare class ObjectFactory {
    private queuedObjects;
    private alwaysObjects;
    private registeredObjects;
    private registeredIds;
    private autoIdCounter;
    create<T>(ctor: Constructor<T>): (...args: ConstructorParameters<Constructor<T>>) => T;
    setOne<T>(ctor: Constructor<T>, instance: T): void;
    setAlways<T>(ctor: Constructor<T>, instance: T): void;
    clear(ctor?: Constructor): void;
    clearAll(): void;
    register(obj: any, id?: string): string;
    getRegistered<T>(id: string): T | undefined;
    getRegisteredId(obj: any): string | undefined;
    private implementsConstructorTracking;
    private extractParameterInfo;
}
export declare function getInstance(): ObjectFactory;
export declare const create: <T>(ctor: Constructor<T>) => (...args: ConstructorParameters<Constructor<T>>) => T;
export declare const setOne: <T>(ctor: Constructor<T>, instance: T) => void;
export declare const setAlways: <T>(ctor: Constructor<T>, instance: T) => void;
export declare const clear: (ctor?: Constructor) => void;
export declare const clearAll: () => void;
export declare const register: (obj: any, id?: string) => string;
export declare const getRegistered: <T>(id: string) => T | undefined;
export {};
//# sourceMappingURL=ObjectFactory.d.ts.map