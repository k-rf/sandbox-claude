/**
 * Repository errors
 *
 * These errors represent failures in repository operations (infrastructure layer).
 */
import { Data } from "effect";

/**
 * Generic repository error
 */
export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
