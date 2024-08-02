export const ROUTES = {
  project: 'project',
  home: '',
};

export const openRoutes = new Set([ROUTES.home]);

export function route(name: string, ...params: string[]) {
  let post = '';
  for (const param of params) {
    post += '/';
    post += param;
  }

  return `/${name}${post}`;
}
