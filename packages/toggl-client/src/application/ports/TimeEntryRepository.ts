/**
 * TimeEntryRepository port
 *
 * Defines the interface for time entry persistence operations.
 * This is implemented by the infrastructure layer.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { DateRange } from "../../domain/models/DateRange";
import type { TimeEntry } from "../../domain/models/TimeEntry";

/**
 * TimeEntryRepository service
 *
 * Provides operations for managing time entries.
 */
export class TimeEntryRepository extends Context.Tag("TimeEntryRepository")<
  TimeEntryRepository,
  {
    /**
     * Find time entries within a date range
     *
     * @param range - Date range to search
     * @returns Effect that resolves to an array of time entries
     */
    readonly findByDateRange: (
      range: DateRange,
    ) => Effect.Effect<readonly TimeEntry[], RepositoryError>;

    /**
     * Find a time entry by ID
     *
     * @param id - Time entry ID
     * @returns Effect that resolves to a time entry or fails if not found
     */
    readonly findById: (
      id: number,
    ) => Effect.Effect<TimeEntry, RepositoryError>;

    /**
     * Get the currently running time entry
     *
     * @returns Effect that resolves to the running entry or null if none
     */
    readonly getCurrent: () => Effect.Effect<TimeEntry | null, RepositoryError>;

    /**
     * Create a new time entry
     *
     * @param entry - Time entry to create (id will be ignored)
     * @returns Effect that resolves to the created time entry with ID
     */
    readonly create: (
      entry: TimeEntry,
    ) => Effect.Effect<TimeEntry, RepositoryError>;

    /**
     * Update an existing time entry
     *
     * @param entry - Time entry with updates
     * @returns Effect that resolves to the updated time entry
     */
    readonly update: (
      entry: TimeEntry,
    ) => Effect.Effect<TimeEntry, RepositoryError>;

    /**
     * Delete a time entry
     *
     * @param id - Time entry ID to delete
     * @returns Effect that resolves when deletion is complete
     */
    readonly delete: (id: number) => Effect.Effect<void, RepositoryError>;

    /**
     * Stop the currently running time entry
     *
     * @param at - Stop timestamp (defaults to now)
     * @returns Effect that resolves to the stopped entry
     */
    readonly stopCurrent: (
      at?: Date,
    ) => Effect.Effect<TimeEntry, RepositoryError>;
  }
>() {}
