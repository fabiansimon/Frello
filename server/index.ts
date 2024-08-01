import { initTRPC } from '@trpc/server';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';

const t = initTRPC.create();

const appRouter = t.router({
  taskList: t.procedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .query(async ({ input }) => {
      console.log(input);
      return 'hello world';
    }),
});

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});

export type AppRouter = typeof appRouter;
