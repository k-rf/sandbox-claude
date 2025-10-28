/**
 * Project domain model
 *
 * Represents a project in Toggl Track.
 */
import { Data } from "effect";

/**
 * Project represents a Toggl project
 *
 * @property id - Unique identifier
 * @property workspaceId - ID of the workspace
 * @property name - Project name
 * @property active - Whether the project is active
 * @property color - Project color hex code
 * @property billable - Whether the project is billable by default
 * @property at - Last update timestamp
 */
export class Project extends Data.Class<{
  readonly id: number;
  readonly workspaceId: number;
  readonly name: string;
  readonly active: boolean;
  readonly color: string;
  readonly billable: boolean;
  readonly at: Date;
}> {
  /**
   * Update the project name
   *
   * @param name - New name
   * @returns New Project instance with updated name
   */
  withName(name: string): Project {
    return new Project({
      ...this,
      name,
      at: new Date(),
    });
  }

  /**
   * Update the project color
   *
   * @param color - New color hex code
   * @returns New Project instance with updated color
   */
  withColor(color: string): Project {
    return new Project({
      ...this,
      color,
      at: new Date(),
    });
  }

  /**
   * Activate the project
   *
   * @returns New Project instance with active status
   */
  activate(): Project {
    return new Project({
      ...this,
      active: true,
      at: new Date(),
    });
  }

  /**
   * Deactivate the project
   *
   * @returns New Project instance with inactive status
   */
  deactivate(): Project {
    return new Project({
      ...this,
      active: false,
      at: new Date(),
    });
  }
}

/**
 * Factory for creating new Project instances
 */
export const ProjectFactory = {
  /**
   * Create a new project
   *
   * @param params - Project parameters
   * @param params.workspaceId
   * @param params.name
   * @param params.color
   * @param params.billable
   * @returns New Project instance
   */
  create(params: {
    readonly workspaceId: number;
    readonly name: string;
    readonly color?: string;
    readonly billable?: boolean;
  }): Project {
    return new Project({
      id: 0,
      workspaceId: params.workspaceId,
      name: params.name,
      active: true,
      color: params.color ?? "#0b83d9",
      billable: params.billable ?? false,
      at: new Date(),
    });
  },
};
