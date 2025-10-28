/**
 * DateRange value object
 *
 * Represents a date range with start and end dates.
 */
import { Data, Effect } from "effect";

import { InvalidDateRangeError } from "../errors/DomainErrors";

/**
 * DateRange represents a time period
 *
 * @property start - Start date (inclusive)
 * @property end - End date (inclusive)
 */
export class DateRange extends Data.Class<{
  readonly start: Date;
  readonly end: Date;
}> {
  /**
   * Check if a date is within this range
   *
   * @param date - Date to check
   * @returns True if the date is within the range
   */
  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  /**
   * Get the duration in days
   *
   * @returns Duration in days
   */
  get durationInDays(): number {
    const diffMs = this.end.getTime() - this.start.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }
}

/**
 * DateRange factory with validation
 */
export const DateRangeFactory = {
  /**
   * Create a date range with validation
   *
   * @param params - Date range parameters
   * @param params.start
   * @param params.end
   * @returns Effect that resolves to DateRange or fails with InvalidDateRangeError
   */
  create(params: {
    readonly start: Date;
    readonly end: Date;
  }): Effect.Effect<DateRange, InvalidDateRangeError> {
    return Effect.gen(function* () {
      if (params.start > params.end) {
        return yield* Effect.fail(
          new InvalidDateRangeError({
            reason: "Start date must be before or equal to end date",
            start: params.start,
            end: params.end,
          }),
        );
      }

      return new DateRange({
        start: params.start,
        end: params.end,
      });
    });
  },

  /**
   * Create a date range for today
   *
   * @returns DateRange for today
   */
  today(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    return new DateRange({ start, end });
  },

  /**
   * Create a date range for this week
   *
   * @returns DateRange for this week (Monday to Sunday)
   */
  thisWeek(): DateRange {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday is first day

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return new DateRange({ start: monday, end: sunday });
  },

  /**
   * Create a date range for this month
   *
   * @returns DateRange for this month
   */
  thisMonth(): DateRange {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return new DateRange({ start, end });
  },

  /**
   * Create a date range for the last N days
   *
   * @param days - Number of days
   * @returns DateRange for the last N days
   */
  lastDays(days: number): DateRange {
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const start = new Date(end);
    start.setDate(end.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);

    return new DateRange({ start, end });
  },
};
