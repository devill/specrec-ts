import { ObjectFactory, IConstructorCalledWith, ConstructorParameterInfo, getInstance, clearAll } from './ObjectFactory';

class TestClass {
  constructor() {}
}

class TestClassWithConstructor {
  constructor(public name: string, public value: number) {}
}

interface IEmailService {
  send(to: string, subject: string): void;
}

class EmailService implements IEmailService {
  send(to: string, subject: string): void {
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class MockEmailService implements IEmailService {
  calls: Array<{ to: string; subject: string }> = [];

  send(to: string, subject: string): void {
    this.calls.push({ to, subject });
  }
}

class TrackedService implements IConstructorCalledWith {
  receivedParams?: ConstructorParameterInfo[];

  constructor(public config: string, public port: number) {}

  constructorCalledWith(params: ConstructorParameterInfo[]): void {
    this.receivedParams = params;
  }
}

describe('ObjectFactory', () => {
  let factory: ObjectFactory;

  beforeEach(() => {
    factory = new ObjectFactory();
    clearAll();
  });

  describe('Basic Create', () => {
    it('creates instance with parameterless constructor', () => {
      const result = factory.create(TestClass)();

      expect(result).toBeInstanceOf(TestClass);
    });

    it('creates instance with constructor parameters', () => {
      const result = factory.create(TestClassWithConstructor)('test', 42);

      expect(result).toBeInstanceOf(TestClassWithConstructor);
      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });

    it('creates multiple different instances', () => {
      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClass)();

      expect(result1).not.toBe(result2);
    });

    it('works with duck typing', () => {
      const service: IEmailService = factory.create(EmailService)();

      expect(service.send).toBeDefined();
    });
  });

  describe('SetOne', () => {
    it('returns queued object once', () => {
      const mock = new TestClass();
      factory.setOne(TestClass, mock);

      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClass)();

      expect(result1).toBe(mock);
      expect(result2).not.toBe(mock);
      expect(result2).toBeInstanceOf(TestClass);
    });

    it('queues multiple objects in FIFO order', () => {
      const mock1 = new TestClass();
      const mock2 = new TestClass();

      factory.setOne(TestClass, mock1);
      factory.setOne(TestClass, mock2);

      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClass)();

      expect(result1).toBe(mock1);
      expect(result2).toBe(mock2);
    });

    it('works with duck typed mocks', () => {
      const mock = new MockEmailService();
      factory.setOne(EmailService, mock);

      const service: IEmailService = factory.create(EmailService)();

      expect(service).toBe(mock);
      service.send('test@example.com', 'Test');
      expect(mock.calls).toHaveLength(1);
    });
  });

  describe('SetAlways', () => {
    it('always returns the same instance', () => {
      const mock = new TestClass();
      factory.setAlways(TestClass, mock);

      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClass)();
      const result3 = factory.create(TestClass)();

      expect(result1).toBe(mock);
      expect(result2).toBe(mock);
      expect(result3).toBe(mock);
    });

    it('setOne takes precedence over setAlways', () => {
      const alwaysMock = new TestClass();
      const onceMock = new TestClass();

      factory.setAlways(TestClass, alwaysMock);
      factory.setOne(TestClass, onceMock);

      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClass)();

      expect(result1).toBe(onceMock);
      expect(result2).toBe(alwaysMock);
    });

    it('can replace existing setAlways', () => {
      const mock1 = new TestClass();
      const mock2 = new TestClass();

      factory.setAlways(TestClass, mock1);
      factory.setAlways(TestClass, mock2);

      const result = factory.create(TestClass)();

      expect(result).toBe(mock2);
    });
  });

  describe('Clear Operations', () => {
    it('clear removes specific type registrations', () => {
      const mock = new TestClass();
      factory.setAlways(TestClass, mock);

      factory.clear(TestClass);

      const result = factory.create(TestClass)();
      expect(result).not.toBe(mock);
      expect(result).toBeInstanceOf(TestClass);
    });

    it('clear removes both setOne and setAlways', () => {
      const onceMock = new TestClass();
      const alwaysMock = new TestClass();

      factory.setOne(TestClass, onceMock);
      factory.setAlways(TestClass, alwaysMock);

      factory.clear(TestClass);

      const result = factory.create(TestClass)();
      expect(result).not.toBe(onceMock);
      expect(result).not.toBe(alwaysMock);
    });

    it('clearAll removes all registrations', () => {
      const mock1 = new TestClass();
      const mock2 = new TestClassWithConstructor('test', 1);

      factory.setAlways(TestClass, mock1);
      factory.setAlways(TestClassWithConstructor, mock2);

      factory.clearAll();

      const result1 = factory.create(TestClass)();
      const result2 = factory.create(TestClassWithConstructor)('new', 2);

      expect(result1).not.toBe(mock1);
      expect(result2).not.toBe(mock2);
    });
  });

  describe('Constructor Parameter Tracking', () => {
    it('calls constructorCalledWith when implemented', () => {
      const service = factory.create(TrackedService)('localhost', 8080);

      expect(service.receivedParams).toBeDefined();
      expect(service.receivedParams).toHaveLength(2);
      expect(service.receivedParams![0]).toEqual({
        index: 0,
        type: 'string',
        value: 'localhost'
      });
      expect(service.receivedParams![1]).toEqual({
        index: 1,
        type: 'number',
        value: 8080
      });
    });

    it('does not call constructorCalledWith when not implemented', () => {
      const result = factory.create(TestClassWithConstructor)('test', 42);

      expect(result.name).toBe('test');
      expect(result.value).toBe(42);
    });
  });

  describe('Object Registration', () => {
    it('registers and retrieves objects by ID', () => {
      const config = { server: 'localhost', port: 5432 };
      factory.register(config, 'testConfig');

      const retrieved = factory.getRegistered<typeof config>('testConfig');

      expect(retrieved).toBe(config);
    });

    it('generates auto ID when not provided', () => {
      const obj1 = { value: 1 };
      const obj2 = { value: 2 };

      const id1 = factory.register(obj1);
      const id2 = factory.register(obj2);

      expect(id1).toBe('auto_1');
      expect(id2).toBe('auto_2');
      expect(factory.getRegistered(id1)).toBe(obj1);
      expect(factory.getRegistered(id2)).toBe(obj2);
    });

    it('returns existing ID for already registered object', () => {
      const obj = { value: 1 };

      const id1 = factory.register(obj, 'first');
      const id2 = factory.register(obj);

      expect(id1).toBe('first');
      expect(id2).toBe('first');
    });

    it('can replace ID for existing object', () => {
      const obj = { value: 1 };

      factory.register(obj, 'first');
      factory.register(obj, 'second');

      expect(factory.getRegistered('first')).toBeUndefined();
      expect(factory.getRegistered('second')).toBe(obj);
      expect(factory.getRegisteredId(obj)).toBe('second');
    });

    it('clearAll clears registered objects', () => {
      const obj = { value: 1 };
      factory.register(obj, 'testObj');

      factory.clearAll();

      expect(factory.getRegistered('testObj')).toBeUndefined();
    });
  });

  describe('Global Instance', () => {
    it('getInstance returns singleton', () => {
      const instance1 = getInstance();
      const instance2 = getInstance();

      expect(instance1).toBe(instance2);
    });

    it('global functions use singleton instance', () => {
      const { create, setAlways } = require('./ObjectFactory');
      const mock = new TestClass();

      setAlways(TestClass, mock);
      const result = create(TestClass)();

      expect(result).toBe(mock);
    });
  });

  describe('Curried Syntax', () => {
    it('supports clean curried syntax', () => {
      const createService = factory.create(TestClassWithConstructor);
      const service1 = createService('service1', 1);
      const service2 = createService('service2', 2);

      expect(service1.name).toBe('service1');
      expect(service2.name).toBe('service2');
    });

    it('type inference works with curried syntax', () => {
      const createService = factory.create(TestClassWithConstructor);

      const service = createService('test', 42);

      expect(service.name).toBe('test');
      expect(service.value).toBe(42);
    });
  });
});