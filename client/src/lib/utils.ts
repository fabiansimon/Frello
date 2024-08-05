import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';

/**
 * Combines multiple class names into a single class string, merging Tailwind CSS classes when necessary.
 *
 * @param {...ClassValue[]} inputs - The class names to combine.
 * @returns {string} - The combined class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Pluralizes a word based on the given amount.
 *
 * @param {number} amount - The amount to determine pluralization.
 * @param {string} post - The word to pluralize.
 * @returns {string} - The pluralized string.
 */
export function pluralize(amount: number, post: string): string {
  return `${amount || 'no'} ${post}${amount > 1 || amount === 0 ? 's' : ''}`;
}

/**
 * Generates a UUID (Universally Unique Identifier).
 *
 * @returns {string} - A new UUID.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Converts a date to a readable string format.
 *
 * @param {Date} [date] - The date to format. Defaults to the current date if not provided.
 * @param {boolean} [short=false] - Whether to use a short format. Defaults to false.
 * @returns {string} - The formatted date string.
 */
export function getReadableDate(date?: Date, short: boolean = false): string {
  const now = date ? new Date(date) : new Date();

  const shortOptions = {
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
  };

  const options = {
    weekday: 'short' as const,
    year: 'numeric' as const,
    month: 'short' as const,
    day: 'numeric' as const,
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: true,
  };

  return now.toLocaleDateString('en-US', short ? shortOptions : options);
}

/**
 * Calculates the difference between the current date and a given date.
 *
 * @param {Date} date - The date to compare with the current date.
 * @returns {Object} - An object containing a human-readable text of the difference and the unit of time.
 */
export function getDateDifference(date: Date): { text: string; unit: string } {
  const now = new Date();
  const difference = now.getTime() - new Date(date).getTime();

  const units = [
    { name: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { name: 'month', value: 30 * 24 * 60 * 60 * 1000 },
    { name: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { name: 'day', value: 24 * 60 * 60 * 1000 },
    { name: 'hour', value: 60 * 60 * 1000 },
    { name: 'minute', value: 60 * 1000 },
    { name: 'second', value: 1000 },
  ];

  // Loop through units to find the largest applicable unit for the time difference
  for (const unit of units) {
    const amount = Math.floor(difference / unit.value);
    if (amount >= 1) {
      return {
        text: `${amount} ${unit.name}${amount > 1 ? 's' : ''} ago`,
        unit: unit.name,
      };
    }
  }

  return {
    text: 'just now',
    unit: 'seconds',
  };
}
