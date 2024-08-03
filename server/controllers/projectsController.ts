import { z } from 'zod';
import { publicProcedure } from '../trpc';
import { prisma } from '..';

export const fetchUserProjects = publicProcedure.query(async ({ ctx }) => {
  try {
    const projects = await prisma.project.findMany();
    return projects;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching user projects');
  }
});

export const fetchProject = publicProcedure
  .input(
    z.object({
      projectId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { projectId } = input;
    try {
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

      return {
        tasks,
        users,
        project,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching tasks');
    }
  });

export const createProject = publicProcedure
  .input(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { title, description } = input;

    try {
      const project = await prisma.project.create({
        data: {
          title,
          description,
        },
        include: {
          users: true,
          tasks: true,
        },
      });

      return project;
    } catch (error) {
      console.error(error);
      throw new Error('Error creating project');
    }
  });

export const addUserToProject = publicProcedure
  .input(z.object({ email: z.string().email(), projectId: z.string() }))
  .mutation(async ({ input }) => {
    try {
      const { email, projectId } = input;

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) throw new Error('No user found with the provided email.');

      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

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
  .mutation(async ({ input }) => {
    try {
      const { userId, projectId } = input;

      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) throw new Error('No user found with the provided ID.');

      const project = await prisma.project.findFirst({
        where: { id: projectId },
      });
      if (!project)
        throw new Error('No project found with the provided project ID.');

      await prisma.project.update({
        where: { id: projectId },
        data: {
          users: {
            disconnect: { id: userId },
          },
        },
        include: {
          users: true,
        },
      });

      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  });
