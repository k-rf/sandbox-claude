/**
 * DatabaseRepository port
 *
 * Defines the interface for database operations.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { Database } from "../../domain/models/Database";

/**
 * DatabaseRepository service
 *
 * Provides operations for retrieving database information.
 */
export class DatabaseRepository extends Context.Tag("DatabaseRepository")<
  DatabaseRepository,
  {
    /**
     * Find a database by ID
     *
     * @param id - Database ID
     * @returns Effect that resolves to a database or fails if not found
     */
    readonly findById: (id: string) => Effect.Effect<Database, RepositoryError>;
  }
>() {}
