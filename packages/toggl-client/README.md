# @monorepo/toggl-client

Toggl Track API client built with Effect-TS and Hexagonal Architecture (Ports & Adapters).

## Architecture

This package follows the Hexagonal Architecture pattern with strict dependency rules:

```
src/
├── domain/           # Domain layer (business logic, entities)
│   ├── models/       # Domain models (pure type definitions)
│   ├── services/     # Domain services (business logic)
│   └── errors/       # Domain errors
├── application/      # Application layer (use cases)
│   ├── usecases/     # Use case implementations
│   └── ports/        # Port definitions (interfaces)
├── infrastructure/   # Infrastructure layer (external system adapters)
│   ├── adapters/     # Adapter implementations (port implementations)
│   └── http/         # HTTP communication
└── index.ts          # Public API exports
```

### Dependency Direction

```
infrastructure → application → domain
       ↓              ↓
    adapters       ports
```

**Rules:**
- Domain layer: No dependencies on other layers
- Application layer: Depends only on Domain
- Infrastructure layer: Implements Application ports

## Features

- ✅ Type-safe Toggl Track API client
- ✅ Effect-TS for composable, type-safe side effects
- ✅ Dependency injection via Effect Layers
- ✅ Comprehensive error handling with typed errors
- ✅ Immutable domain models

## Installation

```bash
npm install @monorepo/toggl-client
```

## Usage

```typescript
import { Effect, Layer } from "effect";
import { TimeEntryRepository } from "@monorepo/toggl-client";
import { TogglTimeEntryRepositoryLive } from "@monorepo/toggl-client/adapters";
import { HttpClientLive } from "@monorepo/toggl-client/http";

// Setup layers
const AppLayer = TogglTimeEntryRepositoryLive.pipe(
  Layer.provide(HttpClientLive)
);

// Use the repository
const program = Effect.gen(function* (_) {
  const repo = yield* _(TimeEntryRepository);
  const entries = yield* _(repo.findByDateRange({
    start: new Date("2025-01-01"),
    end: new Date("2025-01-31")
  }));
  return entries;
}).pipe(Effect.provide(AppLayer));

// Run
Effect.runPromise(program).then(console.log);
```

## Domain Models

- `TimeEntry`: Time tracking entry
- `Project`: Toggl project
- `Tag`: Entry tag
- `Workspace`: Toggl workspace

## API Coverage

- [x] Time Entries (CRUD)
- [ ] Projects (CRUD)
- [ ] Tags (CRUD)
- [ ] Workspaces (Read)
- [ ] Reports

## Development

```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

## License

MIT
