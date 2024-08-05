import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { authUser } from '../utils/authHelper';
import { prisma } from '..';

export const fetchUserProjects = publicProcedure.query(async ({ ctx }) => {
  try {
    const userId = authUser(ctx);

    const projects = await prisma.project.findMany({
      where: { users: { some: { id: userId } } },
    });

    return projects;
  } catch (error) {
    console.error(error);
    throw error;
  }
});

export const fetchProject = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { projectId } = input;
    try {
      const userId = authUser(ctx);

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

      if (!users.some((u) => u.id === userId))
        throw new Error('User is not part of the project.');

      return {
        tasks,
        users,
        project,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  });

export const createProject = publicProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { title, description } = input;

    try {
      const userId = authUser(ctx);

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
      console.error(error);
      throw error;
    }
  });

export const deleteProject = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { projectId } = input;

    try {
      const userId = authUser(ctx);

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
      if (adminId !== userId)
        throw new Error('Not authorized to delete project');

      const taskIds = tasks.map((t) => t.id);

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
      console.error(error);
      throw error;
    }
  });

export const addUserToProject = publicProcedure
  .input(z.object({ email: z.string().email(), projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const userId = authUser(ctx);

      const { email, projectId } = input;

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) throw new Error('No user found with the provided email.');

      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

      if (project.adminId !== userId)
        throw new Error('Only the admin can add users to the project.');

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
      console.error(error);
      throw error;
    }
  });

export const removeUserFromProject = publicProcedure
  .input(z.object({ userId: z.string(), projectId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    try {
      const userId = authUser(ctx);

      const { userId: removeId, projectId } = input;

      const user = await prisma.user.findFirst({ where: { id: removeId } });
      if (!user) throw new Error('No user found with the provided ID.');

      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

      if (project.adminId !== userId)
        throw new Error('Only the admin can remove users from the project.');

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

      await prisma.task.updateMany({
        where: {
          assigneeId: removeId,
        },
        data: { assigneeId: null },
      });

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
