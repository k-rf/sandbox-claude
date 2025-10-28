/**
 * Domain errors for Notion client
 *
 * These errors represent business rule violations in the domain layer.
 */
import { Data } from "effect";

/**
 * Error thrown when a page ID is invalid
 */
export class InvalidPageIdError extends Data.TaggedError("InvalidPageIdError")<{
  readonly pageId: string;
  readonly reason: string;
}> {}

/**
 * Error thrown when a block ID is invalid
 */
export class InvalidBlockIdError extends Data.TaggedError(
  "InvalidBlockIdError",
)<{
  readonly blockId: string;
  readonly reason: string;
}> {}

/**
 * Error thrown when a database ID is invalid
 */
export class InvalidDatabaseIdError extends Data.TaggedError(
  "InvalidDatabaseIdError",
)<{
  readonly databaseId: string;
  readonly reason: string;
}> {}

/**
 * Error thrown when page properties are invalid
 */
export class InvalidPropertyError extends Data.TaggedError(
  "InvalidPropertyError",
)<{
  readonly propertyName: string;
  readonly reason: string;
}> {}
