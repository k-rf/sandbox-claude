/**
 * Tag domain model
 *
 * Represents a tag in Toggl Track.
 */
import { Data } from "effect";

/**
 * Tag represents a Toggl tag
 *
 * @property id - Unique identifier
 * @property workspaceId - ID of the workspace
 * @property name - Tag name
 * @property at - Last update timestamp
 */
export class Tag extends Data.Class<{
  readonly id: number;
  readonly workspaceId: number;
  readonly name: string;
  readonly at: Date;
}> {}

/**
 * Factory for creating new Tag instances
 */
export const TagFactory = {
  /**
   * Create a new tag
   *
   * @param params - Tag parameters
   * @param params.workspaceId
   * @param params.name
   * @returns New Tag instance
   */
  create(params: { readonly workspaceId: number; readonly name: string }): Tag {
    return new Tag({
      id: 0,
      workspaceId: params.workspaceId,
      name: params.name,
      at: new Date(),
    });
  },
};
