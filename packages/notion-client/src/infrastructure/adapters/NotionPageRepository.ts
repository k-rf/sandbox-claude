/**
 * Notion Page repository implementation
 *
 * Implements PageRepository port using Notion API.
 */
import { Effect, Layer } from "effect";

import * as Schema from "@effect/schema/Schema";

import { PageRepository } from "../../application/ports/PageRepository";
import { RepositoryError } from "../../application/ports/RepositoryErrors";
import { Page, type PageProperties } from "../../domain/models/Page";
import { NotionHttpClient } from "../http/NotionHttpClient";

/**
 * Notion API Page response schema
 */
const NotionPageSchema = Schema.Struct({
  id: Schema.String,
  properties: Schema.Record({
    key: Schema.String,
    value: Schema.Unknown,
  }),
  created_time: Schema.String,
  last_edited_time: Schema.String,
  archived: Schema.Boolean,
  url: Schema.String,
});

type NotionPageResponse = Schema.Schema.Type<typeof NotionPageSchema>;

/**
 * Parse Notion API response to Page domain model
 *
 * @param data - Notion API response data
 * @returns Effect that resolves to Page or fails with RepositoryError
 */
const parsePage = (
  data: NotionPageResponse,
): Effect.Effect<Page, RepositoryError> =>
  Effect.try({
    try: () =>
      new Page({
        id: data.id,
        properties: data.properties as PageProperties,
        createdTime: new Date(data.created_time),
        lastEditedTime: new Date(data.last_edited_time),
        archived: data.archived,
        url: data.url,
      }),
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse page response",
        cause: error,
      }),
  });

/**
 * Format PageProperties to Notion API request format
 *
 * @param properties - Page properties
 * @returns Notion API request object
 */
const formatProperties = (
  properties: PageProperties,
): Record<string, unknown> => {
  return properties as Record<string, unknown>;
};

/**
 * Live layer for PageRepository using Notion API
 */
export const NotionPageRepositoryLive = Layer.effect(
  PageRepository,
  Effect.gen(function* () {
    const httpClient = yield* NotionHttpClient;

    return PageRepository.of({
      findById: (id: string) =>
        Effect.gen(function* () {
          const response = yield* httpClient.get(`/pages/${id}`).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: `Failed to fetch page ${id}`,
                  cause: error,
                }),
            ),
          );

          const decode = Schema.decodeUnknown(NotionPageSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode page response",
                  cause: error,
                }),
            ),
          );

          return yield* parsePage(parsed);
        }),

      queryDatabase: (databaseId: string, filter?: Record<string, unknown>) =>
        Effect.gen(function* () {
          const body: Record<string, unknown> = {};
          if (filter !== undefined) {
            body.filter = filter;
          }

          const response = yield* httpClient
            .post(`/databases/${databaseId}/query`, { body })
            .pipe(
              Effect.mapError(
                (error) =>
                  new RepositoryError({
                    message: `Failed to query database ${databaseId}`,
                    cause: error,
                  }),
              ),
            );

          const resultsSchema = Schema.Struct({
            results: Schema.Array(NotionPageSchema),
          });

          const decode = Schema.decodeUnknown(resultsSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode database query response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(parsed.results.map(parsePage));
        }),

      create: (databaseId: string, properties: PageProperties) =>
        Effect.gen(function* () {
          const body = {
            parent: { database_id: databaseId },
            properties: formatProperties(properties),
          };

          const response = yield* httpClient.post("/pages", { body }).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to create page",
                  cause: error,
                }),
            ),
          );

          const decode = Schema.decodeUnknown(NotionPageSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode created page response",
                  cause: error,
                }),
            ),
          );

          return yield* parsePage(parsed);
        }),

      update: (id: string, properties: PageProperties) =>
        Effect.gen(function* () {
          const body = {
            properties: formatProperties(properties),
          };

          const response = yield* httpClient
            .patch(`/pages/${id}`, { body })
            .pipe(
              Effect.mapError(
                (error) =>
                  new RepositoryError({
                    message: `Failed to update page ${id}`,
                    cause: error,
                  }),
              ),
            );

          const decode = Schema.decodeUnknown(NotionPageSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode updated page response",
                  cause: error,
                }),
            ),
          );

          return yield* parsePage(parsed);
        }),

      archive: (id: string) =>
        Effect.gen(function* () {
          const body = {
            archived: true,
          };

          yield* httpClient.patch(`/pages/${id}`, { body }).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: `Failed to archive page ${id}`,
                  cause: error,
                }),
            ),
          );
        }),
    });
  }),
);
