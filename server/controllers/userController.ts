import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '..';
import { signToken } from '../utils/jwt';

// Procedure to register a new user
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
      // Check if a user already exists with the given email
      const existing = await prisma.user.findFirst({
        where: { email },
      });
      if (existing)
        throw new Error(
          'User already exists with that email. Please log in instead.'
        );

      // Create a new user if one does not exist
      const user = await prisma.user.create({
        data: {
          name,
          email,
          expertise,
          role,
        },
      });

      // Generate a JWT token for the new user
      const token = signToken({ userId: user.id });

      return { user, token };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  });

// Procedure to log in an existing user
export const loginUser = publicProcedure
  .input(
    z.object({
      email: z.string().email(),
    })
  )
  .mutation(async ({ input }) => {
    const { email } = input;
    try {
      // Check if a user exists with the given email
      const user = await prisma.user.findFirst({
        where: { email },
      });

      if (!user) throw new Error('No user found with that email');

      // Generate a JWT token for the existing user
      const token = signToken({ userId: user.id });

      return { user, token };
    } catch (error) {
      console.error('Error login in user:', error);
      throw error;
    }
  });
