import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '..';
import { signToken } from '../utils/jwt';

export const registerUser = publicProcedure
  .input(
    z.object({
      name: z.string(),
      role: z.string(),
      email: z.string().email(),
      expertise: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { name, email, expertise, role } = input;

    try {
      const existing = await prisma.user.findFirst({
        where: { email },
      });
      if (existing)
        throw new Error(
          'User already exists with that email. Please log in instead.'
        );

      const user = await prisma.user.create({
        data: {
          name,
          email,
          expertise,
          role,
        },
      });

      const token = signToken({ userId: user.id });

      return { user, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });

export const loginUser = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    const { email } = input;
    try {
      const user = await prisma.user.findFirst({
        where: { email },
      });
      if (!user) throw new Error('No user found with that email');

      const token = signToken({ userId: user.id });

      return { user, token };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
