# SpecRec for TypeScript

**Turn untestable legacy code into comprehensive test suites in minutes**

## Introduction: From Legacy Code to Tests in 3 Steps

SpecRec helps you test legacy code by recording real method calls and replaying them as test doubles. Here's the complete workflow:

### Step 1: Break Dependencies with create()

Replace direct instantiation (`new`) with `create()` to make dependencies controllable:

```typescript
// Before: Hard dependency
const emailService = new EmailService(connectionString);

// After: Testable dependency
import { create } from 'specrec-ts';
const emailService = create(EmailService)(connectionString);
```

### Step 2: Write a Test (Coming Soon)

*Note: Context API and automatic recording/verification are planned features. Currently, you can use manual test doubles with ObjectFactory.*

### Step 3: Run Test and Fill Return Values (Coming Soon)

*Note: Automatic specification generation and Parrot replay are planned features.*

## Installation

Add to your test project:

```bash
npm install specrec-ts
```

Or with yarn:

```bash
yarn add specrec-ts
```

## Core Components

### ObjectFactory: Making Dependencies Testable

**Use Case:** Your legacy code creates dependencies with `new`, making it impossible to inject test doubles.

**Solution:** Replace `new` with `create()` to enable dependency injection without major refactoring.

#### In Regular Tests

```typescript
import { ObjectFactory } from 'specrec-ts';

describe('MyService', () => {
  let factory: ObjectFactory;

  beforeEach(() => {
    factory = new ObjectFactory();
  });

  afterEach(() => {
    factory.clearAll();
  });

  it('should use mock repository', () => {
    // Setup
    const mockRepo = new MockRepository();
    factory.setOne(Repository, mockRepo);

    // Act - your code calls create(Repository)() and gets mockRepo
    const service = new MyService(factory);
    const result = service.processData();

    // Assert
    expect(result).toEqual(expected);
  });
});
```

#### Breaking Dependencies

Transform hard dependencies into testable code:

```typescript
// Legacy code with hard dependency
class UserService {
  processUser(id: number) {
    const repo = new SqlRepository("server=prod;...");
    const user = repo.getUser(id);
    // ...
  }
}

// Testable code using ObjectFactory
import { create } from 'specrec-ts';

class UserService {
  processUser(id: number) {
    const repo = create(SqlRepository)("server=prod;...");
    const user = repo.getUser(id);
    // ...
  }
}
```

#### Curried Syntax Benefits

The curried syntax `create(Class)(args)` provides a clean, functional approach:

```typescript
// Create a factory function for a specific class
const createEmailService = create(EmailService);

// Use it multiple times with different parameters
const service1 = createEmailService("smtp1.example.com", 587);
const service2 = createEmailService("smtp2.example.com", 465);

// Type inference works perfectly
const repo = create(UserRepository)("connection-string");
// TypeScript knows repo is UserRepository
```

### Test Double Injection

**Use Case:** You need to replace real services with test doubles during testing.

**Solution:** Use `setOne` for single-use mocks or `setAlways` for persistent test doubles.

#### Single-Use Test Doubles

```typescript
import { ObjectFactory } from 'specrec-ts';

const factory = new ObjectFactory();

// Queue a test double for single use
const mockService = new MockEmailService();
factory.setOne(EmailService, mockService);

const service1 = factory.create(EmailService)(); // Returns mockService
const service2 = factory.create(EmailService)(); // Creates new EmailService
```

#### Persistent Test Doubles

```typescript
// Set a persistent test double
const mockDb = new MockDatabase();
factory.setAlways(DatabaseService, mockDb);

const db1 = factory.create(DatabaseService)(); // Returns mockDb
const db2 = factory.create(DatabaseService)(); // Same mockDb instance
const db3 = factory.create(DatabaseService)(); // Still mockDb
```

#### Priority: SetOne Over SetAlways

```typescript
const alwaysMock = new AlwaysMockService();
const onceMock = new OnceMockService();

factory.setAlways(MyService, alwaysMock);
factory.setOne(MyService, onceMock);

const service1 = factory.create(MyService)(); // Returns onceMock
const service2 = factory.create(MyService)(); // Returns alwaysMock
```

### Duck Typing Advantage

**Use Case:** You have interfaces and multiple implementations but don't want complex registration.

**Solution:** TypeScript's structural typing automatically handles compatibility.

```typescript
interface IEmailService {
  send(to: string, subject: string): void;
}

class EmailService implements IEmailService {
  send(to: string, subject: string): void {
    // Real implementation
  }
}

class MockEmailService {
  calls: Array<{to: string; subject: string}> = [];

  send(to: string, subject: string): void {
    this.calls.push({to, subject});
  }
}

// All compatible - no registration needed!
factory.setOne(EmailService, new MockEmailService());
const service: IEmailService = factory.create(EmailService)();
// TypeScript is happy because MockEmailService is structurally compatible
```

### Object ID Tracking

**Use Case:** Your methods pass around complex objects that are hard to serialize in specifications.

**Solution:** Register objects with IDs to show clean references instead of verbose dumps.

```typescript
const factory = new ObjectFactory();

// Complex configuration object
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'testdb',
  credentials: { /* ... */ }
};

// Register with ID
factory.register(dbConfig, 'testDbConfig');

// Later retrieve by ID
const config = factory.getRegistered<DatabaseConfig>('testDbConfig');

// Auto-generate IDs if not provided
const obj1 = { value: 1 };
const id = factory.register(obj1); // Returns 'auto_1'
```

### Constructor Parameter Tracking

**Use Case:** You need to verify what parameters were passed to constructors during object creation.

**Solution:** Implement `IConstructorCalledWith` interface to receive parameter information.

```typescript
import { IConstructorCalledWith, ConstructorParameterInfo } from 'specrec-ts';

class TrackedService implements IConstructorCalledWith {
  private params?: ConstructorParameterInfo[];

  constructor(
    public config: string,
    public port: number,
    public options?: ServiceOptions
  ) {}

  constructorCalledWith(params: ConstructorParameterInfo[]): void {
    this.params = params;
    // params[0] = { index: 0, type: 'string', value: 'localhost' }
    // params[1] = { index: 1, type: 'number', value: 8080 }
    // params[2] = { index: 2, type: 'object', value: {...} }
  }
}

const service = factory.create(TrackedService)('localhost', 8080, { timeout: 5000 });
// constructorCalledWith is automatically called with parameter details
```

### Clear Operations

**Use Case:** You need to reset factory state between tests to ensure test isolation.

**Solution:** Use `clear()` for specific types or `clearAll()` for complete reset.

```typescript
// Clear specific type
factory.clear(EmailService);

// Clear all registrations
factory.clearAll();

// Global singleton cleanup
import { clearAll } from 'specrec-ts';
clearAll(); // Clears the global instance
```

### Global Instance Pattern

**Use Case:** You want to use ObjectFactory throughout your codebase without passing instances.

**Solution:** Use the global singleton with convenient exports.

```typescript
import { create, setOne, setAlways, clearAll } from 'specrec-ts';

// All functions use the global singleton
setAlways(EmailService, mockEmailService);

// Anywhere in your code
const service = create(EmailService)();

// Clean up in test teardown
afterEach(() => {
  clearAll();
});
```

## Advanced Features

### Type Safety

TypeScript provides full type safety and IntelliSense:

```typescript
class UserService {
  constructor(
    private name: string,
    private age: number,
    private admin: boolean
  ) {}
}

// TypeScript enforces correct parameter types
const service = create(UserService)("John", 30, true); // ✅ Correct

// Type errors are caught at compile time
const service2 = create(UserService)(30, "John", true); // ❌ Type error
const service3 = create(UserService)("John"); // ❌ Missing parameters
```

### Working with Async Constructors

While JavaScript doesn't support async constructors directly, you can work with factory patterns:

```typescript
class AsyncService {
  private constructor(private data: any) {}

  static async create(url: string): Promise<AsyncService> {
    const data = await fetch(url).then(r => r.json());
    return new AsyncService(data);
  }
}

// Use with factory
const servicePromise = AsyncService.create('https://api.example.com');
```

## Migration Examples

### Before (Direct Instantiation)
```typescript
class OrderProcessor {
  processOrder(orderId: string) {
    const db = new DatabaseConnection("prod-server");
    const emailService = new EmailService("smtp.example.com", 587);
    const order = db.getOrder(orderId);

    if (order.status === 'pending') {
      // Process order
      emailService.sendConfirmation(order.customerEmail);
    }
  }
}
```

### After (Using ObjectFactory)
```typescript
import { create } from 'specrec-ts';

class OrderProcessor {
  processOrder(orderId: string) {
    const db = create(DatabaseConnection)("prod-server");
    const emailService = create(EmailService)("smtp.example.com", 587);
    const order = db.getOrder(orderId);

    if (order.status === 'pending') {
      // Process order
      emailService.sendConfirmation(order.customerEmail);
    }
  }
}
```

### In Tests
```typescript
import { setOne, clearAll } from 'specrec-ts';

describe('OrderProcessor', () => {
  afterEach(() => clearAll());

  it('should send confirmation email for pending orders', () => {
    // Arrange
    const mockDb = new MockDatabase();
    mockDb.setOrder('123', { status: 'pending', customerEmail: 'customer@example.com' });

    const mockEmail = new MockEmailService();

    setOne(DatabaseConnection, mockDb);
    setOne(EmailService, mockEmail);

    // Act
    const processor = new OrderProcessor();
    processor.processOrder('123');

    // Assert
    expect(mockEmail.sentEmails).toContainEqual({
      to: 'customer@example.com',
      type: 'confirmation'
    });
  });
});
```

## Requirements

- Node.js 14+
- TypeScript 4.5+
- Any test framework (Jest, Mocha, Vitest, etc.)

## License

See LICENSE.md