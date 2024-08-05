//
import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { authUser } from '../utils/authHelper';
import { prisma } from '..';

export const createComment = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
      taskId: z.string(),
      text: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { taskId, text, projectId } = input;

    try {
      const userId = authUser(ctx);

      const project = await prisma.project.findFirst({
        where: { id: projectId },
        include: { users: true, tasks: true },
      });

      if (!project)
        throw new Error('No project found with the provided project ID.');

      const { users, tasks } = project;

      if (!users.some((u) => u.id === userId))
        throw new Error('User is not part of the project.');

      if (!tasks.some((t) => t.id === taskId))
        throw new Error('Task ID was not found.');

      const comment = await prisma.comment.create({
        data: {
          content: text,
          taskId,
          userId,
        },
      });

      return comment;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

export const removeComment = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
      commentId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { commentId, projectId } = input;

    try {
      const userId = authUser(ctx);

      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });

      if (!project) throw new Error('No project found with that ID');

      const comment = await prisma.comment.findFirst({
        where: { id: commentId },
      });

      if (!comment) throw new Error('No comment found with that ID');

      if (comment.userId !== userId && project.adminId !== userId)
        throw new Error('Not authorized to delete comment');

      await prisma.comment.delete({
        where: { id: commentId },
      });

      return comment;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

export const fetchComments = publicProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { taskId } = input;

    try {
      authUser(ctx);

      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
          user: true,
        },
      });

      return comments;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
