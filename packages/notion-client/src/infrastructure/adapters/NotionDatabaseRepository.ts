/**
 * Notion Database repository implementation
 *
 * Implements DatabaseRepository port using Notion API.
 */
import { Effect, Layer } from "effect";

import * as Schema from "@effect/schema/Schema";

import { DatabaseRepository } from "../../application/ports/DatabaseRepository";
import { RepositoryError } from "../../application/ports/RepositoryErrors";
import { Database } from "../../domain/models/Database";
import { NotionHttpClient } from "../http/NotionHttpClient";

/**
 * Notion API Database response schema
 */
const NotionDatabaseSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.Array(Schema.Unknown),
  description: Schema.Array(Schema.Unknown),
  properties: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }),
  created_time: Schema.String,
  last_edited_time: Schema.String,
  archived: Schema.Boolean,
  url: Schema.String,
});

type NotionDatabaseResponse = Schema.Schema.Type<typeof NotionDatabaseSchema>;

/**
 * Parse Notion API response to Database domain model
 *
 * @param data - Notion API response data
 * @returns Effect that resolves to Database or fails with RepositoryError
 */
const parseDatabase = (
  data: NotionDatabaseResponse,
): Effect.Effect<Database, RepositoryError> =>
  Effect.try({
    try: () =>
      new Database({
        id: data.id,
        title: data.title as Database["title"],
        description: data.description as Database["description"],
        properties: data.properties as Database["properties"],
        createdTime: new Date(data.created_time),
        lastEditedTime: new Date(data.last_edited_time),
        archived: data.archived,
        url: data.url,
      }),
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse database response",
        cause: error,
      }),
  });

/**
 * Live layer for DatabaseRepository using Notion API
 */
export const NotionDatabaseRepositoryLive = Layer.effect(
  DatabaseRepository,
  Effect.gen(function* () {
    const httpClient = yield* NotionHttpClient;

    return DatabaseRepository.of({
      findById: (id: string) =>
        Effect.gen(function* () {
          const response = yield* httpClient.get(`/databases/${id}`).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: `Failed to fetch database ${id}`,
                  cause: error,
                }),
            ),
          );

          const decode = Schema.decodeUnknown(NotionDatabaseSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode database response",
                  cause: error,
                }),
            ),
          );

          return yield* parseDatabase(parsed);
        }),
    });
  }),
);
