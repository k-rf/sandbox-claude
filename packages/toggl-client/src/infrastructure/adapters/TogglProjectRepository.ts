/**
 * TogglProjectRepository adapter
 *
 * Implements ProjectRepository using Toggl Track API.
 */
import { Effect, Layer, Schema } from "effect";

import {
  ProjectRepository,
  RepositoryError,
} from "../../application/ports/index";
import { Project } from "../../domain/models/Project";
import { TogglHttpClient } from "../http/TogglHttpClient";

/**
 * Toggl API project response schema
 */
const TogglProjectSchema = Schema.Struct({
  id: Schema.Number,
  workspace_id: Schema.Number,
  name: Schema.String,
  active: Schema.Boolean,
  color: Schema.String,
  billable: Schema.Boolean,
  at: Schema.String,
});

/**
 * Parse Toggl API project response to domain model
 *
 * @param data - Toggl API project response
 * @returns Effect that resolves to Project domain model
 */
const parseProject = (
  data: Schema.Schema.Type<typeof TogglProjectSchema>,
): Effect.Effect<Project, RepositoryError> =>
  Effect.try({
    try: () =>
      new Project({
        id: data.id,
        workspaceId: data.workspace_id,
        name: data.name,
        active: data.active,
        color: data.color,
        billable: data.billable,
        at: new Date(data.at),
      }),
    catch: (error) =>
      new RepositoryError({
        message: "Failed to parse project response",
        cause: error,
      }),
  });

/**
 * Format project domain model to Toggl API request
 *
 * @param project - Project domain model
 * @returns Toggl API request object
 */
const formatProject = (project: Project): Record<string, unknown> => ({
  name: project.name,
  active: project.active,
  color: project.color,
  billable: project.billable,
});

/**
 * TogglProjectRepository implementation
 */
export const TogglProjectRepositoryLive = Layer.effect(
  ProjectRepository,
  Effect.gen(function* () {
    const httpClient = yield* TogglHttpClient;

    return ProjectRepository.of({
      findByWorkspace: (workspaceId: number, activeOnly = false) =>
        Effect.gen(function* () {
          const url = `/workspaces/${workspaceId}/projects`;
          const params = activeOnly ? { active: "true" } : {};

          const response = yield* Effect.tryPromise({
            try: () => httpClient.get(url, { params }),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to fetch projects for workspace ${workspaceId}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(Schema.Array(TogglProjectSchema));
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode projects response",
                  cause: error,
                }),
            ),
          );

          return yield* Effect.all(parsed.map(parseProject));
        }),

      findById: (id: number) =>
        Effect.gen(function* () {
          // Note: Toggl API doesn't have a direct endpoint for fetching a single project by ID
          // We need to fetch all projects and filter, or we need the workspace_id
          // For now, we'll implement this by requiring the project to have a workspace_id
          // This is a limitation of the Toggl API design

          // Since we don't have workspace_id here, we'll need to fetch from all workspaces
          // This is not ideal, but necessary given the API constraints
          const response = yield* Effect.tryPromise({
            try: () => httpClient.get("/me/projects"),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to fetch project ${id}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(Schema.Array(TogglProjectSchema));
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode project response",
                  cause: error,
                }),
            ),
          );

          const projectData = parsed.find((p) => p.id === id);
          if (projectData === undefined) {
            return yield* Effect.fail(
              new RepositoryError({
                message: `Project ${id} not found`,
              }),
            );
          }

          return yield* parseProject(projectData);
        }),

      create: (project: Project) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              httpClient.post(`/workspaces/${project.workspaceId}/projects`, {
                body: formatProject(project),
              }),
            catch: (error) =>
              new RepositoryError({
                message: "Failed to create project",
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglProjectSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode created project response",
                  cause: error,
                }),
            ),
          );

          return yield* parseProject(parsed);
        }),

      update: (project: Project) =>
        Effect.gen(function* () {
          const response = yield* Effect.tryPromise({
            try: () =>
              httpClient.put(
                `/workspaces/${project.workspaceId}/projects/${project.id}`,
                {
                  body: formatProject(project),
                },
              ),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to update project ${project.id}`,
                cause: error,
              }),
          });

          const decode = Schema.decodeUnknown(TogglProjectSchema);
          const parsed = yield* decode(response).pipe(
            Effect.mapError(
              (error) =>
                new RepositoryError({
                  message: "Failed to decode updated project response",
                  cause: error,
                }),
            ),
          );

          return yield* parseProject(parsed);
        }),

      delete: (id: number) =>
        Effect.gen(function* () {
          // Note: Similar to findById, we need workspace_id to delete a project
          // We'll first fetch the project to get its workspace_id
          const project = yield* ProjectRepository.of({
            findByWorkspace: () => Effect.succeed([]),
            findById: (projectId: number) =>
              Effect.gen(function* () {
                const response = yield* Effect.tryPromise({
                  try: () => httpClient.get("/me/projects"),
                  catch: (error) =>
                    new RepositoryError({
                      message: `Failed to fetch project ${projectId}`,
                      cause: error,
                    }),
                });

                const decode = Schema.decodeUnknown(
                  Schema.Array(TogglProjectSchema),
                );
                const parsed = yield* decode(response).pipe(
                  Effect.mapError(
                    (error) =>
                      new RepositoryError({
                        message: "Failed to decode project response",
                        cause: error,
                      }),
                  ),
                );

                const projectData = parsed.find((p) => p.id === projectId);
                if (projectData === undefined) {
                  return yield* Effect.fail(
                    new RepositoryError({
                      message: `Project ${projectId} not found`,
                    }),
                  );
                }

                return yield* parseProject(projectData);
              }),
            create: () => Effect.fail(new RepositoryError({ message: "" })),
            update: () => Effect.fail(new RepositoryError({ message: "" })),
            delete: () => Effect.fail(new RepositoryError({ message: "" })),
          }).findById(id);

          yield* Effect.tryPromise({
            try: () =>
              httpClient.delete(
                `/workspaces/${project.workspaceId}/projects/${id}`,
              ),
            catch: (error) =>
              new RepositoryError({
                message: `Failed to delete project ${id}`,
                cause: error,
              }),
          });
        }),
    });
  }),
);
