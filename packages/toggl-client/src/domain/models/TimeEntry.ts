/**
 * TimeEntry domain model
 *
 * Represents a time tracking entry in Toggl Track.
 * This is an immutable domain model using Effect's Data class.
 */
import { Data } from "effect";

/**
 * TimeEntry represents a single time tracking session
 *
 * @property id - Unique identifier
 * @property workspaceId - ID of the workspace
 * @property projectId - ID of the project (optional)
 * @property description - Entry description
 * @property start - Start timestamp
 * @property stop - Stop timestamp (null if running)
 * @property duration - Duration in seconds (negative if running)
 * @property tags - Array of tag names
 * @property at - Last update timestamp
 */
export class TimeEntry extends Data.Class<{
  readonly id: number;
  readonly workspaceId: number;
  readonly projectId: number | null;
  readonly description: string;
  readonly start: Date;
  readonly stop: Date | null;
  readonly duration: number;
  readonly tags: readonly string[];
  readonly at: Date;
}> {
  /**
   * Check if the time entry is currently running
   *
   * @returns True if the entry is running (no stop time)
   */
  get isRunning(): boolean {
    return this.stop === null;
  }

  /**
   * Get duration in minutes
   *
   * @returns Duration in minutes (rounded down)
   */
  get durationInMinutes(): number {
    return Math.floor(Math.abs(this.duration) / 60);
  }

  /**
   * Get duration in hours
   *
   * @returns Duration in hours (with decimal)
   */
  get durationInHours(): number {
    return Math.abs(this.duration) / 3600;
  }

  /**
   * Stop a running time entry
   *
   * @param at - Stop timestamp (defaults to now)
   * @returns New TimeEntry instance with stop time set
   */
  stop(at: Date = new Date()): TimeEntry {
    if (!this.isRunning) {
      return this;
    }

    const duration = Math.floor((at.getTime() - this.start.getTime()) / 1000);

    return new TimeEntry({
      ...this,
      stop: at,
      duration,
      at,
    });
  }

  /**
   * Update the description
   *
   * @param description - New description
   * @returns New TimeEntry instance with updated description
   */
  withDescription(description: string): TimeEntry {
    return new TimeEntry({
      ...this,
      description,
      at: new Date(),
    });
  }

  /**
   * Update the tags
   *
   * @param tags - New tags array
   * @returns New TimeEntry instance with updated tags
   */
  withTags(tags: readonly string[]): TimeEntry {
    return new TimeEntry({
      ...this,
      tags,
      at: new Date(),
    });
  }

  /**
   * Add a tag
   *
   * @param tag - Tag to add
   * @returns New TimeEntry instance with tag added
   */
  addTag(tag: string): TimeEntry {
    if (this.tags.includes(tag)) {
      return this;
    }

    return this.withTags([...this.tags, tag]);
  }

  /**
   * Remove a tag
   *
   * @param tag - Tag to remove
   * @returns New TimeEntry instance with tag removed
   */
  removeTag(tag: string): TimeEntry {
    return this.withTags(this.tags.filter((t) => t !== tag));
  }
}

/**
 * Factory for creating new TimeEntry instances
 */
export const TimeEntryFactory = {
  /**
   * Create a new running time entry
   *
   * @param params - Time entry parameters
   * @param params.workspaceId
   * @param params.description
   * @param params.projectId
   * @param params.tags
   * @param params.start
   * @returns New TimeEntry instance
   */
  create(params: {
    readonly workspaceId: number;
    readonly description: string;
    readonly projectId?: number;
    readonly tags?: readonly string[];
    readonly start?: Date;
  }): TimeEntry {
    const now = new Date();
    const start = params.start ?? now;

    return new TimeEntry({
      id: 0, // Will be set by the API
      workspaceId: params.workspaceId,
      projectId: params.projectId ?? null,
      description: params.description,
      start,
      stop: null,
      duration: -Math.floor((now.getTime() - start.getTime()) / 1000),
      tags: params.tags ?? [],
      at: now,
    });
  },

  /**
   * Create a stopped time entry
   *
   * @param params - Time entry parameters
   * @param params.workspaceId
   * @param params.description
   * @param params.start
   * @param params.stop
   * @param params.projectId
   * @param params.tags
   * @returns New TimeEntry instance
   */
  createStopped(params: {
    readonly workspaceId: number;
    readonly description: string;
    readonly start: Date;
    readonly stop: Date;
    readonly projectId?: number;
    readonly tags?: readonly string[];
  }): TimeEntry {
    const duration = Math.floor(
      (params.stop.getTime() - params.start.getTime()) / 1000,
    );

    return new TimeEntry({
      id: 0,
      workspaceId: params.workspaceId,
      projectId: params.projectId ?? null,
      description: params.description,
      start: params.start,
      stop: params.stop,
      duration,
      tags: params.tags ?? [],
      at: new Date(),
    });
  },
};
