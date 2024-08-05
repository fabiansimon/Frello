import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server/index';
import { LocalStorage } from './lib/localStorage';

// Create a TRPC React instance with the AppRouter type
export const trpc = createTRPCReact<AppRouter>();

// Create a TRPC client with an HTTP batch link
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc', // URL to the TRPC server
      headers() {
        // Fetch the JWT token from local storage
        const token = LocalStorage.fetchUserData()?.jwt;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
