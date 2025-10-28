/**
 * TogglWorkspaceRepository adapter
 *
 * Implements WorkspaceRepository using Toggl Track API.
 */
import { Effect, Layer, Schema } from "effect";

import {
  WorkspaceRepository,
  RepositoryError,
} from "../../application/ports/index";
import { Workspace } from "../../domain/models/Workspace";
import { TogglHttpClient } from "../http/TogglHttpClient";

/**
 * Toggl API workspace response schema
 */
const TogglWorkspaceSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  premium: Schema.Boolean,
  at: Schema.String,
});

/**
 * Parse Toggl API workspace response to domain model
 *
 * @param data - Toggl API workspace response
 * @returns Effect that resolves to Workspace domain model
 */
const parseWorkspace = (
  data: Schema.Schema.Type<typeof TogglWorkspaceSchema>,
): Effect.Effect<Workspace, RepositoryError> =>
  Effect.try({
    try: () =>
      new Workspace({
        id: data.id,
        name: data.name,
        premium: data.premium,
        at: new Date(data.at),
      }),
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse workspace response",
        cause: error,
      }),
  });

/**
 * TogglWorkspaceRepository implementation
 */
export const TogglWorkspaceRepositoryLive = Layer.effect(
  WorkspaceRepository,
  Effect.gen(function* () {
    const httpClient = yield* TogglHttpClient;

    return WorkspaceRepository.of({
      getAll: () =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get("/workspaces"),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to fetch workspaces",
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(
            Schema.Array(TogglWorkspaceSchema),
          );
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode workspaces response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(parsed.map(parseWorkspace));
        }),

      findById: (id: number) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get(`/workspaces/${id}`),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to fetch workspace ${id}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglWorkspaceSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode workspace response",
                  cause: error,
                }),
            ),
          );

          return yield* parseWorkspace(parsed);
        }),
    });
  }),
);
