import { z } from 'zod';
import { protectedProcedure } from '../trpc';
import { prisma } from '..';
import { sendTaskReminder } from '../utils/email';

// Procedure to create a new task
export const createTask = protectedProcedure
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
      // Create a new task in the database
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          projectId,
          assigneeId,
        },
      });

      return task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  });

// Procedure to delete an existing task
export const deleteTask = protectedProcedure
  .input(
    z.object({
      taskId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const { userId } = ctx;
      const { taskId } = input;

      // Find the task by ID, including project details
      const data = await prisma.task.findFirst({
        where: {
          id: taskId,
        },
        include: {
          project: true,
        },
      });

      // Check if the task exists
      if (!data) throw new Error('Task not found with the provided task ID.');
      // Check if the user is authorized to delete the task
      if (data.project.adminId !== userId)
        throw new Error('User is not authorized to delete this task.');

      // Delete the task from the database
      await prisma.task.delete({
        where: {
          id: taskId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });

// Procedure to update an existing task
export const updateTask = protectedProcedure
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
      const { userId } = ctx;
      const { id, projectId, ...updates } = input;

      // Find the project by ID
      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });

      // Check if the project exists
      if (!project)
        throw new Error('Project not found with the provided project ID.');

      // Find the existing task by ID
      const oldTask = await prisma.task.findFirst({
        where: { id },
      });

      // Check if the task exists
      if (!oldTask)
        throw new Error('Task not found with the provided task ID.');

      // Check if the user is authorized to update the task
      if (project.adminId !== userId && oldTask.assigneeId !== userId)
        throw new Error('User is not authorized to update this task.');

      // Update the task in the database
      const task = await prisma.task.update({
        where: { id },
        data: updates,
      });

      // If an assignee ID is provided, send a task reminder email
      if (updates.assigneeId) {
        const user = await prisma.user.findFirst({
          where: {
            id: updates.assigneeId,
          },
        });

        // Check if the assignee exists
        if (!user) throw new Error('User not found with the provided ID.');

        const { email } = user;

        // Send task reminder email
        await sendTaskReminder({ email, taskId: id, projectId });
      }

      return task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  });
