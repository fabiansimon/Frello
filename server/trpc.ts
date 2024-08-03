import { initTRPC } from '@trpc/server';
import { JwtPayload } from 'jsonwebtoken';

export interface UserPayload extends JwtPayload {
  userId: string;
}

export type Context = UserPayload | null;

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
