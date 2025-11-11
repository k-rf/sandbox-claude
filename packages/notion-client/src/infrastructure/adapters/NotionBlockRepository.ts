/**
 * Notion Block repository implementation
 *
 * Implements BlockRepository port using Notion API.
 */
import { Effect, Layer } from "effect";

import * as Schema from "@effect/schema/Schema";

import { BlockRepository } from "../../application/ports/BlockRepository";
import { RepositoryError } from "../../application/ports/RepositoryErrors";
import { Block, type BlockContent } from "../../domain/models/Block";
import { NotionHttpClient } from "../http/NotionHttpClient";

/**
 * Notion API Block response schema
 */
const NotionBlockSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.String,
  created_time: Schema.String,
  last_edited_time: Schema.String,
  has_children: Schema.Boolean,
  archived: Schema.Boolean,
  // Block type-specific content is stored in properties with the same name as type
  // We'll use Schema.Unknown to handle the dynamic structure
});

type NotionBlockResponse = Schema.Schema.Type<typeof NotionBlockSchema> &
  Record<string, unknown>;

/**
 * Parse Notion API response to Block domain model
 *
 * @param data - Notion API response data
 * @returns Effect that resolves to Block or fails with RepositoryError
 */
const parseBlock = (
  data: NotionBlockResponse,
): Effect.Effect<Block, RepositoryError> =>
  Effect.try({
    try: () => {
      // Extract block type-specific content
      const type = data.type as BlockContent["type"];
      const content = {
        type,
        [type]: data[type],
      } as BlockContent;

      return new Block({
        id: data.id,
        type,
        content,
        createdTime: new Date(data.created_time),
        lastEditedTime: new Date(data.last_edited_time),
        hasChildren: data.has_children,
        archived: data.archived,
      });
    },
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse block response",
        cause: error,
      }),
  });

/**
 * Format BlockContent to Notion API request format
 *
 * @param content - Block content
 * @returns Notion API request object
 */
const formatBlockContent = (content: BlockContent): Record<string, unknown> => {
  const { type, ...rest } = content;
  return {
    type,
    ...rest,
  };
};

/**
 * Live layer for BlockRepository using Notion API
 */
export const NotionBlockRepositoryLive = Layer.effect(
  BlockRepository,
  Effect.gen(function* () {
    const httpClient = yield* NotionHttpClient;

    return BlockRepository.of({
      getChildren: (blockId: string) =>
        Effect.gen(function* () {
          const response = yield* httpClient
            .get(`/blocks/${blockId}/children`)
            .pipe(
              Effect.mapError(
                (error) =>
                  new RepositoryError({
                    message: `Failed to fetch block children ${blockId}`,
                    cause: error,
                  }),
              ),
            );

          const resultsSchema = Schema.Struct({
            results: Schema.Array(NotionBlockSchema),
          });

          const decode = Schema.decodeUnknown(resultsSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode block children response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(
            parsed.results.map((block) =>
              parseBlock(block as NotionBlockResponse),
            ),
          );
        }),

      append: (blockId: string, blocks: readonly BlockContent[]) =>
        Effect.gen(function* () {
          const body = {
            children: blocks.map(formatBlockContent),
          };

          const response = yield* httpClient
            .patch(`/blocks/${blockId}/children`, { body })
            .pipe(
              Effect.mapError(
                (error) =>
                  new RepositoryError({
                    message: `Failed to append blocks to ${blockId}`,
                    cause: error,
                  }),
              ),
            );

          const resultsSchema = Schema.Struct({
            results: Schema.Array(NotionBlockSchema),
          });

          const decode = Schema.decodeUnknown(resultsSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode append blocks response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(
            parsed.results.map((block) =>
              parseBlock(block as NotionBlockResponse),
            ),
          );
        }),

      update: (id: string, content: BlockContent) =>
        Effect.gen(function* () {
          const body = formatBlockContent(content);

          const response = yield* httpClient
            .patch(`/blocks/${id}`, { body })
            .pipe(
              Effect.mapError(
                (error) =>
                  new RepositoryError({
                    message: `Failed to update block ${id}`,
                    cause: error,
                  }),
              ),
            );

          const decode = Schema.decodeUnknown(NotionBlockSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode updated block response",
                  cause: error,
                }),
            ),
          );

          return yield* parseBlock(parsed as NotionBlockResponse);
        }),

      delete: (id: string) =>
        Effect.gen(function* () {
          yield* httpClient.delete(`/blocks/${id}`).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: `Failed to delete block ${id}`,
                  cause: error,
                }),
            ),
          );
        }),
    });
  }),
);
