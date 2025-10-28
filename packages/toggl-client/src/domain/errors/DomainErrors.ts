/**
 * Domain errors
 *
 * These errors represent domain-level business rule violations.
 */
import { Data } from "effect";

/**
 * Error thrown when a date range is invalid
 *
 * @property reason - Reason for the error
 * @property start - Start date
 * @property end - End date
 */
export class InvalidDateRangeError extends Data.TaggedError(
  "InvalidDateRangeError",
)<{
  readonly reason: string;
  readonly start: Date;
  readonly end: Date;
}> {}

/**
 * Error thrown when a time entry is not found
 *
 * @property id - ID of the time entry
 */
export class TimeEntryNotFoundError extends Data.TaggedError(
  "TimeEntryNotFoundError",
)<{
  readonly id: number;
}> {}

/**
 * Error thrown when a project is not found
 *
 * @property id - ID of the project
 */
export class ProjectNotFoundError extends Data.TaggedError(
  "ProjectNotFoundError",
)<{
  readonly id: number;
}> {}

/**
 * Error thrown when a tag is not found
 *
 * @property id - ID of the tag
 */
export class TagNotFoundError extends Data.TaggedError("TagNotFoundError")<{
  readonly id: number;
}> {}

/**
 * Error thrown when a workspace is not found
 *
 * @property id - ID of the workspace
 */
export class WorkspaceNotFoundError extends Data.TaggedError(
  "WorkspaceNotFoundError",
)<{
  readonly id: number;
}> {}

/**
 * Error thrown when attempting to modify a stopped time entry
 *
 * @property id - ID of the time entry
 */
export class TimeEntryAlreadyStoppedError extends Data.TaggedError(
  "TimeEntryAlreadyStoppedError",
)<{
  readonly id: number;
}> {}

/**
 * Error thrown when attempting to start a time entry while another is running
 *
 * @property runningEntryId - ID of the currently running entry
 */
export class TimeEntryAlreadyRunningError extends Data.TaggedError(
  "TimeEntryAlreadyRunningError",
)<{
  readonly runningEntryId: number;
}> {}
