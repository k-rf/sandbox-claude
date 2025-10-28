/**
 * Toggl TimeEntry repository implementation
 *
 * Implements TimeEntryRepository port using Toggl API.
 */
import { Effect, Layer } from "effect";

import * as Schema from "@effect/schema/Schema";

import { RepositoryError } from "../../application/ports/RepositoryErrors";
import { TimeEntryRepository } from "../../application/ports/TimeEntryRepository";
import { type DateRange } from "../../domain/models/DateRange";
import { TimeEntry } from "../../domain/models/TimeEntry";
import { TogglHttpClient } from "../http/TogglHttpClient";

/**
 * Toggl API TimeEntry response schema
 */
const TogglTimeEntrySchema = Schema.Struct({
  id: Schema.Number,
  workspace_id: Schema.Number,
  project_id: Schema.Union(Schema.Number, Schema.Null),
  description: Schema.String,
  start: Schema.String,
  stop: Schema.Union(Schema.String, Schema.Null),
  duration: Schema.Number,
  tags: Schema.Array(Schema.String),
  at: Schema.String,
});

type TogglTimeEntryResponse = Schema.Schema.Type<typeof TogglTimeEntrySchema>;

/**
 * Parse Toggl API response to TimeEntry domain model
 *
 * @param data - Toggl API response data
 * @returns Effect that resolves to TimeEntry or fails with RepositoryError
 */
const parseTimeEntry = (
  data: TogglTimeEntryResponse,
): Effect.Effect<TimeEntry, RepositoryError> =>
  Effect.try({
    try: () =>
      new TimeEntry({
        id: data.id,
        workspaceId: data.workspace_id,
        projectId: data.project_id,
        description: data.description,
        start: new Date(data.start),
        stop: data.stop !== null ? new Date(data.stop) : null,
        duration: data.duration,
        tags: data.tags,
        at: new Date(data.at),
      }),
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse time entry response",
        cause: error,
      }),
  });

/**
 * Format TimeEntry domain model to Toggl API request
 *
 * @param entry - TimeEntry domain model
 * @returns Toggl API request object
 */
const formatTimeEntry = (entry: TimeEntry): Record<string, unknown> => {
  // Type assertion to access stop as property, not method (naming collision with stop())
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const stopProp = entry.stop as Date | null;
  const stopIso: string | null =
    stopProp !== null ? stopProp.toISOString() : null;

  return {
    workspace_id: entry.workspaceId,
    project_id: entry.projectId,
    description: entry.description,
    start: entry.start.toISOString(),
    stop: stopIso,
    duration: entry.duration,
    tags: [...entry.tags],
    created_with: "toggl-client",
  };
};

/**
 * Format date to Toggl API date string (YYYY-MM-DD)
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Live layer for TimeEntryRepository using Toggl API
 */
export const TogglTimeEntryRepositoryLive = Layer.effect(
  TimeEntryRepository,
  Effect.gen(function* () {
    const httpClient = yield* TogglHttpClient;

    return TimeEntryRepository.of({
      findByDateRange: (range: DateRange) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              httpClient.get("/me/time_entries", {
                params: {
                  start_date: formatDate(range.start),
                  end_date: formatDate(range.end),
                },
              }),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to fetch time entries",
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(
            Schema.Array(TogglTimeEntrySchema),
          );
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode time entries response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(parsed.map(parseTimeEntry));
        }),

      findById: (id: number) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get(`/me/time_entries/${id}`),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to fetch time entry ${id}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode time entry response",
                  cause: error,
                }),
            ),
          );

          return yield* parseTimeEntry(parsed);
        }),

      getCurrent: () =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get("/me/time_entries/current"),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to fetch current time entry",
                cause: error,
              }),
          });

          if (response === null) {
            return null;
          }

          const decode = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode current time entry response",
                  cause: error,
                }),
            ),
          );

          return yield* parseTimeEntry(parsed);
        }),

      create: (entry: TimeEntry) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              httpClient.post(`/workspaces/${entry.workspaceId}/time_entries`, {
                body: formatTimeEntry(entry),
              }),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to create time entry",
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode created time entry response",
                  cause: error,
                }),
            ),
          );

          return yield* parseTimeEntry(parsed);
        }),

      update: (entry: TimeEntry) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              httpClient.put(
                `/workspaces/${entry.workspaceId}/time_entries/${entry.id}`,
                {
                  body: formatTimeEntry(entry),
                },
              ),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to update time entry ${entry.id}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode updated time entry response",
                  cause: error,
                }),
            ),
          );

          return yield* parseTimeEntry(parsed);
        }),

      delete: (id: number) =>
        Effect.gen(function* () {
          yield* Effect.tryPromise({
            try: () => httpClient.delete(`/me/time_entries/${id}`),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to delete time entry ${id}`,
                cause: error,
              }),
          });
        }),

      stopCurrent: (at?: Date) =>
        Effect.gen(function* () {
          // Get current running entry
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get("/me/time_entries/current"),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to fetch current time entry",
                cause: error,
              }),
          });

          if (response === null) {
            return yield* Effect.fail(
              new RepositoryError({
                message: "No running time entry to stop",
              }),
            );
          }

          const decode = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode current time entry response",
                  cause: error,
                }),
            ),
          );

          const current = yield* parseTimeEntry(parsed);
          const stopped = current.stop(at);

          // Update the stopped entry
          const updateResponse = yield* Effect.tryPromise({
            try: () =>
              httpClient.put(
                `/workspaces/${stopped.workspaceId}/time_entries/${stopped.id}`,
                {
                  body: formatTimeEntry(stopped),
                },
              ),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to update time entry ${stopped.id}`,
                cause: error,
              }),
          });

          const decodeStopped = Schema.decodeUnknown(TogglTimeEntrySchema);
          const parsedStopped = yield* decodeStopped(updateResponse).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode updated time entry response",
                  cause: error,
                }),
            ),
          );

          return yield* parseTimeEntry(parsedStopped);
        }),
    });
  }),
);
