import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/index';
import { LocalStorage } from './lib/localStorage';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
      headers() {
        const token = LocalStorage.fetchUserData()?.jwt;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
