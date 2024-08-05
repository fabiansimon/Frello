import { Context } from '../trpc';

/**
 * Authenticates a user from the provided context.
 *
 * @param {Object} ctx - The context object that potentially contains user authentication details.
 * @returns {string} - The authenticated user's ID.
 * @throws {Error} - Throws an error if the user is not authenticated.
 */
export function authUser(ctx?: Object): string {
  if (!ctx) {
    throw new Error('Unauthorized');
  }

  const context = ctx as Context;

  if (!context || !context.userId) {
    throw new Error('Unauthorized');
  }

  return context.userId;
}
