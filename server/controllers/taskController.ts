import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '..';
import { authUser } from '../utils/authHelper';
import { sendTaskReminder } from '../utils/email';

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
  .mutation(async ({ input, ctx }) => {
    try {
      authUser(ctx);

      const { taskId } = input;

      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

export const updateTask = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z
        .enum(['ToDo', 'InProgress', 'InReview', 'Declined', 'Done'])
        .optional(),
      assigneeId: z.string().nullable().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      authUser(ctx);

      const { id, projectId, ...updates } = input;
      const task = await prisma.task.update({
        where: { id },
        data: updates,
      });

      if (updates.assigneeId) {
        const user = await prisma.user.findFirst({
          where: {
            id: updates.assigneeId,
          },
        });

        if (!user) throw new Error('User with that ID not found.');

        const { email } = user;

        await sendTaskReminder({ email, taskId: id, projectId });
      }

      return task;
    } catch (error) {}
  });
