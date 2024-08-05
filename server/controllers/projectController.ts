import { z } from 'zod';
import { protectedProcedure } from '../trpc';
import { prisma } from '..';

// Fetch projects associated with the authenticated user
export const fetchUserProjects = protectedProcedure.query(async ({ ctx }) => {
  try {
    const { userId } = ctx;

    // Find all projects where the user is a member
    const projects = await prisma.project.findMany({
      where: { users: { some: { id: userId } } },
    });

    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
});

// Fetch a specific project by ID
export const fetchProject = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { projectId } = input;
    try {
      const { userId } = ctx;

      // Find the project with its tasks and users
      const data = await prisma.project.findFirst({
        where: {
          id: projectId,
        },
        include: {
          tasks: true,
          users: true,
        },
      });

      if (!data)
        throw new Error('No project found with the provided project ID.');

      const { users, tasks, ...project } = data;

      // Check if the authenticated user is part of the project
      if (!users.some((u) => u.id === userId))
        throw new Error('User is not part of the project.');

      return {
        tasks,
        users,
        project,
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
  });

// Create a new project
export const createProject = protectedProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { title, description } = input;

    try {
      const { userId } = ctx;

      // Create a new project with the authenticated user as the admin
      const project = await prisma.project.create({
        data: {
          adminId: userId,
          title,
          description,
          users: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          users: true,
          tasks: true,
        },
      });

      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  });

// Delete an existing project
export const deleteProject = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { projectId } = input;

    try {
      const { userId } = ctx;

      // Find the project and its related tasks and comments
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
        },
        include: {
          tasks: {
            include: {
              comments: true,
            },
          },
          users: true,
        },
      });

      if (!project) throw new Error('No project found with that ID');

      const { tasks, adminId } = project;

      // Check if the authenticated user is the admin
      if (adminId !== userId)
        throw new Error('Not authorized to delete project');

      const taskIds = tasks.map((t) => t.id);

      // Delete comments, tasks, and the project itself in a transaction
      await prisma.$transaction([
        prisma.comment.deleteMany({
          where: {
            taskId: {
              in: taskIds,
            },
          },
        }),
        prisma.task.deleteMany({
          where: {
            projectId: projectId,
          },
        }),
        prisma.project.update({
          where: {
            id: projectId,
          },
          data: {
            users: {
              set: [],
            },
          },
        }),
        prisma.project.delete({
          where: {
            id: projectId,
          },
        }),
      ]);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  });

// Add a user to a project
export const addUserToProject = protectedProcedure
  .input(z.object({ email: z.string().email(), projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const { userId } = ctx;
      const { email, projectId } = input;

      // Find the user by email
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) throw new Error('No user found with the provided email.');

      // Find the project by ID
      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

      // Check if the authenticated user is the admin
      if (project.adminId !== userId)
        throw new Error('Only the admin can add users to the project.');

      // Add the user to the project
      await prisma.project.update({
        where: { id: projectId },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
        include: {
          users: true,
        },
      });

      return user;
    } catch (error) {
      console.error('Error adding user to project:', error);
      throw error;
    }
  });

// Remove a user from a project
export const removeUserFromProject = protectedProcedure
  .input(z.object({ userId: z.string(), projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const { userId } = ctx;
      const { userId: removeId, projectId } = input;

      // Find the user by ID
      const user = await prisma.user.findFirst({ where: { id: removeId } });
      if (!user) throw new Error('No user found with the provided ID.');

      // Find the project by ID
      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

      // Check if the authenticated user is the admin
      if (project.adminId !== userId)
        throw new Error('Only the admin can remove users from the project.');

      // Remove the user from the project
      await prisma.project.update({
        where: { id: projectId },
        data: {
          users: {
            disconnect: { id: removeId },
          },
        },
        include: {
          users: true,
        },
      });

      // Set the assigneeId to null for all tasks assigned to the removed user
      await prisma.task.updateMany({
        where: {
          assigneeId: removeId,
        },
        data: { assigneeId: null },
      });

      return true;
    } catch (error) {
      console.error('Error removing users from project:', error);
      throw error;
    }
  });
