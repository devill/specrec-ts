# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Test
- Install dependencies: `npm install`
- Build: `npm run build`
- Run all tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage: `npm run test:coverage`
- Build and test before publish: `npm run prepublishOnly`

## Architecture Overview

This is the TypeScript implementation of SpecRec, a legacy testing library that enables testing untestable code through record-replay.

### Key Components

**ObjectFactory** - Dependency injection replacement for `new` keyword
- Singleton pattern accessible via `ObjectFactory.instance()`
- `create<T>(constructorArgs)` method for controllable object creation
- Global convenience methods available with `import { Create } from 'specrec-ts'`

**Context** - High-level test orchestration API
- Primary entry point for SpecRec testing via `Context.verify()`
- Fluent API for test double setup
- Handles test isolation and cleanup automatically

**CallLogger** - Records method interactions
- Uses Proxy-based interception for transparent method logging
- Outputs human-readable specifications with emoji decorations
- Thread-safe logging context management

**Parrot** - Replays interactions from verified files
- Reads `.verified.txt` files to provide predetermined return values
- Creates dynamic proxies that match method calls by signature
- Eliminates need for manual mock implementations

### Testing Framework Integration

- Built for Jest testing framework
- Uses approval-style testing with `.received.txt`/`.verified.txt` files
- Supports data-driven testing from verified specification files

### Important Notes

- Built on Node.js 14.0.0+
- Uses TypeScript 5.9+ with strict typing
- Follows PolyForm Noncommercial License 1.0.0