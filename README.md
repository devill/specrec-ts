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

#### In Tests

```typescript
import { setOne, clearAll } from 'specrec-ts';

describe('UserService', () => {
  afterEach(() => {
    clearAll();
  });

  it('should process user successfully', () => {
    // Setup
    const mockRepo = new MockSqlRepository();
    mockRepo.users.set(123, { name: 'John', email: 'john@example.com' });

    setOne(SqlRepository, mockRepo);

    // Act
    const service = new UserService();
    const result = service.processUser(123);

    // Assert
    expect(result).toEqual({ name: 'John', email: 'john@example.com' });
  });
});
```

### Test Double Injection

Use `setOne` for single-use mocks or `setAlways` for persistent test doubles:

```typescript
import { ObjectFactory, setOne, setAlways } from 'specrec-ts';

// Single-use test double (consumed after first use)
setOne(EmailService, mockEmailService);

// Persistent test double (used for all calls)
setAlways(DatabaseService, mockDatabaseService);

// setOne takes priority over setAlways
setAlways(MyService, alwaysService);
setOne(MyService, onceService);
const service1 = create(MyService)(); // Returns onceService
const service2 = create(MyService)(); // Returns alwaysService
```

### Factory Instance Usage

For more control, use ObjectFactory instances:

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

### Global Singleton Pattern

Use the global singleton for convenience:

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

### Constructor Parameter Tracking

Implement `IConstructorCalledWith` to receive parameter information:

```typescript
import { IConstructorCalledWith, ConstructorParameterInfo } from 'specrec-ts';

class TrackedService implements IConstructorCalledWith {
  constructor(
    public config: string,
    public port: number
  ) {}

  constructorCalledWith(params: ConstructorParameterInfo[]): void {
    // params[0] = { index: 0, type: 'string', value: 'localhost' }
    // params[1] = { index: 1, type: 'number', value: 8080 }
  }
}

const service = create(TrackedService)('localhost', 8080);
// constructorCalledWith is automatically called with parameter details
```

### Object Registration

Register objects with IDs for clean test specifications:

```typescript
const factory = new ObjectFactory();

// Complex configuration object
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'testdb'
};

// Register with ID
factory.register(dbConfig, 'testDbConfig');

// Later retrieve by ID
const config = factory.getRegistered<DatabaseConfig>('testDbConfig');

// Auto-generate IDs if not provided
const obj1 = { value: 1 };
const id = factory.register(obj1); // Returns 'auto_1'
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