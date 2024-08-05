// Define the routes for the application
export const ROUTES = {
  project: 'project',
  home: '',
};

/**
 * Generates a URL path for a given route name and parameters.
 */
export function route(name: string, ...params: string[]): string {
  let post = '';
  for (const param of params) {
    post += '/';
    post += param;
  }

  return `/${name}${post}`;
}
