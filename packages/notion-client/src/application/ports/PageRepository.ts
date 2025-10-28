/**
 * PageRepository port
 *
 * Defines the interface for page persistence operations.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { Page, PageProperties } from "../../domain/models/Page";

/**
 * PageRepository service
 *
 * Provides operations for managing Notion pages.
 */
export class PageRepository extends Context.Tag("PageRepository")<
  PageRepository,
  {
    /**
     * Find a page by ID
     *
     * @param id - Page ID
     * @returns Effect that resolves to a page or fails if not found
     */
    readonly findById: (id: string) => Effect.Effect<Page, RepositoryError>;

    /**
     * Query pages in a database
     *
     * @param databaseId - Database ID
     * @param filter - Optional filter object
     * @returns Effect that resolves to an array of pages
     */
    readonly queryDatabase: (
      databaseId: string,
      filter?: Record<string, unknown>,
    ) => Effect.Effect<readonly Page[], RepositoryError>;

    /**
     * Create a new page in a database
     *
     * @param databaseId - Parent database ID
     * @param properties - Page properties
     * @returns Effect that resolves to the created page with ID
     */
    readonly create: (
      databaseId: string,
      properties: PageProperties,
    ) => Effect.Effect<Page, RepositoryError>;

    /**
     * Update an existing page
     *
     * @param id - Page ID
     * @param properties - Properties to update
     * @returns Effect that resolves to the updated page
     */
    readonly update: (
      id: string,
      properties: PageProperties,
    ) => Effect.Effect<Page, RepositoryError>;

    /**
     * Archive a page
     *
     * @param id - Page ID to archive
     * @returns Effect that resolves when archiving is complete
     */
    readonly archive: (id: string) => Effect.Effect<void, RepositoryError>;
  }
>() {}
