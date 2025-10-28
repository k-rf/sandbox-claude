/**
 * Toggl Track API client with Effect-TS and Hexagonal Architecture.
 *
 * @example
 * ```typescript
 * import { Effect, Layer } from "effect";
 * import {
 *   TimeEntryRepository,
 *   TogglTimeEntryRepositoryLive,
 *   TogglConfigLive,
 *   DateRangeFactory
 * } from "@monorepo/toggl-client";
 *
 * const AppLayer = TogglTimeEntryRepositoryLive.pipe(
 *   Layer.provide(TogglConfigLive)
 * );
 *
 * const program = Effect.gen(function* (_) {
 *   const repo = yield* _(TimeEntryRepository);
 *   const range = DateRangeFactory.today();
 *   const entries = yield* _(repo.findByDateRange(range));
 *   return entries;
 * }).pipe(Effect.provide(AppLayer));
 *
 * Effect.runPromise(program).then(console.log);
 * ```
 */

// Domain models
export * from "./domain/models";
export * from "./domain/errors/DomainErrors";

// Application ports
export * from "./application/ports";

// Infrastructure
export * from "./infrastructure/adapters";
export * from "./infrastructure/http";
