/**
 * ProjectRepository port
 *
 * Defines the interface for project persistence operations.
 */
import { Context, type Effect } from "effect";

import { type RepositoryError } from "./RepositoryErrors";

import type { Project } from "../../domain/models/Project";

/**
 * ProjectRepository service
 *
 * Provides operations for managing projects.
 */
export class ProjectRepository extends Context.Tag("ProjectRepository")<
  ProjectRepository,
  {
    /**
     * Find all projects in a workspace
     *
     * @param workspaceId - Workspace ID
     * @param activeOnly - Only return active projects (default: false)
     * @returns Effect that resolves to an array of projects
     */
    readonly findByWorkspace: (
      workspaceId: number,
      activeOnly?: boolean,
    ) => Effect.Effect<readonly Project[], RepositoryError>;

    /**
     * Find a project by ID
     *
     * @param id - Project ID
     * @returns Effect that resolves to a project or fails if not found
     */
    readonly findById: (id: number) => Effect.Effect<Project, RepositoryError>;

    /**
     * Create a new project
     *
     * @param project - Project to create
     * @returns Effect that resolves to the created project with ID
     */
    readonly create: (
      project: Project,
    ) => Effect.Effect<Project, RepositoryError>;

    /**
     * Update an existing project
     *
     * @param project - Project with updates
     * @returns Effect that resolves to the updated project
     */
    readonly update: (
      project: Project,
    ) => Effect.Effect<Project, RepositoryError>;

    /**
     * Delete a project
     *
     * @param id - Project ID to delete
     * @returns Effect that resolves when deletion is complete
     */
    readonly delete: (id: number) => Effect.Effect<void, RepositoryError>;
  }
>() {}
