/**
 * Repository errors
 *
 * These errors are returned by repository operations when they fail.
 */
import { Data } from "effect";

/**
 * Generic repository error
 *
 * @property message - Error message
 * @property cause - Original error cause (if any)
 */
export class RepositoryError extends Data.TaggedError("RepositoryError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Error thrown when a resource is not found
 *
 * @property resourceType - Type of resource that was not found
 * @property id - ID of the resource
 */
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly resourceType: string;
  readonly id: number | string;
}> {}

/**
 * Error thrown when a network/HTTP operation fails
 *
 * @property statusCode - HTTP status code
 * @property message - Error message
 * @property cause - Original error
 */
export class NetworkError extends Data.TaggedError("NetworkError")<{
  readonly statusCode?: number;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Error thrown when data validation fails
 *
 * @property message - Error message
 * @property errors - Validation errors
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  readonly message: string;
  readonly errors: readonly string[];
}> {}
