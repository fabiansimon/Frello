import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '..';

export const createTask = publicProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
      status: z.enum(['ToDo', 'InProgress', 'InReview', 'Declined', 'Done']),
      projectId: z.string(),
      assigneeId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { title, description, status, projectId, assigneeId } = input;
    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          projectId,
          assigneeId,
          updatedAt: new Date(),
        },
      });

      return task;
    } catch (error) {
      console.error(error);
      throw new Error('Error creating task');
    }
  });

export const deleteTask = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { taskId } = input;

      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      throw new Error('Error creating task');
    }
  });

export const updateTask = publicProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z
        .enum(['ToDo', 'InProgress', 'InReview', 'Declined', 'Done'])
        .optional(),
      assigneeId: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const { id, ...updates } = input;
      const task = await prisma.task.update({
        where: { id },
        data: updates,
      });

      return task;
    } catch (error) {}
  });

export const createUser = publicProcedure
  .input(
    z.object({
      name: z.string(),
      role: z.string(),
      email: z.string(),
      expertise: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { name, email, expertise, role } = input;
    try {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          expertise,
          role,
          updatedAt: new Date(),
        },
      });

      return user;
    } catch (error) {
      console.log(error);
      throw new Error('Error when creating User');
    }
  });
