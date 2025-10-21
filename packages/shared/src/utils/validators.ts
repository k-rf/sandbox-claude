/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate non-empty string
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate positive number
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
