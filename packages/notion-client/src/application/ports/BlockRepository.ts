/**
 * BlockRepository port
 *
 * Defines the interface for block operations.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { Block, BlockContent } from "../../domain/models/Block";

/**
 * BlockRepository service
 *
 * Provides operations for managing Notion blocks.
 */
export class BlockRepository extends Context.Tag("BlockRepository")<
  BlockRepository,
  {
    /**
     * Get child blocks of a block or page
     *
     * @param blockId - Parent block or page ID
     * @returns Effect that resolves to an array of blocks
     */
    readonly getChildren: (
      blockId: string,
    ) => Effect.Effect<readonly Block[], RepositoryError>;

    /**
     * Append blocks to a parent block or page
     *
     * @param blockId - Parent block or page ID
     * @param blocks - Blocks to append
     * @returns Effect that resolves to the created blocks with IDs
     */
    readonly append: (
      blockId: string,
      blocks: readonly BlockContent[],
    ) => Effect.Effect<readonly Block[], RepositoryError>;

    /**
     * Update a block
     *
     * @param id - Block ID
     * @param content - New block content
     * @returns Effect that resolves to the updated block
     */
    readonly update: (
      id: string,
      content: BlockContent,
    ) => Effect.Effect<Block, RepositoryError>;

    /**
     * Delete a block
     *
     * @param id - Block ID to delete
     * @returns Effect that resolves when deletion is complete
     */
    readonly delete: (id: string) => Effect.Effect<void, RepositoryError>;
  }
>() {}
