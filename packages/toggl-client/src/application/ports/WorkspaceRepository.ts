/**
 * WorkspaceRepository port
 *
 * Defines the interface for workspace operations.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { Workspace } from "../../domain/models/Workspace";

/**
 * WorkspaceRepository service
 *
 * Provides operations for retrieving workspace information.
 */
export class WorkspaceRepository extends Context.Tag("WorkspaceRepository")<
  WorkspaceRepository,
  {
    /**
     * Get all workspaces for the current user
     *
     * @returns Effect that resolves to an array of workspaces
     */
    readonly getAll: () => Effect.Effect<readonly Workspace[], RepositoryError>;

    /**
     * Find a workspace by ID
     *
     * @param id - Workspace ID
     * @returns Effect that resolves to a workspace or fails if not found
     */
    readonly findById: (
      id: number,
    ) => Effect.Effect<Workspace, RepositoryError>;
  }
>() {}
