import { initTRPC } from '@trpc/server';
import { JwtPayload } from 'jsonwebtoken';
import { authUser } from './utils/authHelper';

// Define a UserPayload include userId
export interface UserPayload extends JwtPayload {
  userId: string;
}

// Make context optional (if not authenticated)
export type Context = UserPayload | null;

const t = initTRPC.create();

const isAuth = t.middleware(({ ctx, next }) => {
  const userId = authUser(ctx);
  return next({
    ctx: {
      ...ctx,
      userId,
    },
  });
});

// Export the router, public- and protectedProcedures
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuth);
