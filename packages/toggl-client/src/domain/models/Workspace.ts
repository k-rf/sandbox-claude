/**
 * Workspace domain model
 *
 * Represents a workspace in Toggl Track.
 */
import { Data } from "effect";

/**
 * Workspace represents a Toggl workspace
 *
 * @property id - Unique identifier
 * @property name - Workspace name
 * @property premium - Whether the workspace has premium features
 * @property at - Last update timestamp
 */
export class Workspace extends Data.Class<{
  readonly id: number;
  readonly name: string;
  readonly premium: boolean;
  readonly at: Date;
}> {}
