import { z } from 'zod';
import { protectedProcedure } from '../trpc';
import { prisma } from '..';

// Procedure to create a new comment on a task
export const createComment = protectedProcedure
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
      const { userId } = ctx;

      // Fetch the project along with its users and tasks
      const project = await prisma.project.findFirst({
        where: { id: projectId },
        include: { users: true, tasks: true },
      });

      if (!project)
        throw new Error('Project not found with the provided project ID.');

      const { users, tasks } = project;

      if (!users.some((u) => u.id === userId))
        throw new Error('User is not a member of the project.');

      if (!tasks.some((t) => t.id === taskId))
        throw new Error('Task not found with the provided task ID.');

      // Create a new comment
      const comment = await prisma.comment.create({
        data: {
          content: text,
          taskId,
          userId,
        },
      });

      return comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  });

// Procedure to remove a comment from a task
export const removeComment = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      commentId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { commentId, projectId } = input;

    try {
      const { userId } = ctx;

      // Fetch the project
      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });

      // Check if the project exists
      if (!project)
        throw new Error('Project not found with the provided project ID.');

      // Fetch the comment
      const comment = await prisma.comment.findFirst({
        where: { id: commentId },
      });

      // Check if the comment exists
      if (!comment)
        throw new Error('Comment not found with the provided comment ID.');

      // Check if the user is authorized to delete the comment
      if (comment.userId !== userId && project.adminId !== userId)
        throw new Error('Not authorized to delete this comment.');

      // Delete the comment
      await prisma.comment.delete({
        where: { id: commentId },
      });

      return comment;
    } catch (error) {
      console.error('Error removing comment:', error);
      throw error;
    }
  });

// Procedure to fetch comments for a task
export const fetchComments = protectedProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { taskId } = input;

    try {
      // Fetch comments for the task along with user details
      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: {
          user: true,
        },
      });

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  });
