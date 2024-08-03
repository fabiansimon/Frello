import { initTRPC } from '@trpc/server';
import cors from 'cors';
import { REGEX } from './constants/regex';
import express from 'express';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';
import { getOpenAISuggestion } from './controllers/openAIController';

const prisma = new PrismaClient();

const t = initTRPC.create();

const appRouter = t.router({
  fetchUserProjects: t.procedure.query(async () => {
    try {
      const projects = await prisma.project.findMany();
      return projects;
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching user projects');
    }
  }),

  fetchProject: t.procedure
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
    }),

  fetchAISuggestion: t.procedure
    .input(
      z.object({
        projectId: z.string(),
        taskDescription: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { projectId, taskDescription } = input;

      try {
        const data = await prisma.project.findFirst({
          where: {
            id: projectId,
          },
          include: {
            users: true,
          },
        });
        if (!data)
          throw new Error('No project found with the provided project ID.');

        const { users } = data;

        const suggestion = await getOpenAISuggestion({
          users,
          taskDescription,
        });
        if (!suggestion || !REGEX.uuid.test(suggestion))
          throw new Error('Invalid AI Suggestion. Please try again later.');

        return { userId: suggestion };
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching AI suggestion');
      }
    }),

  createProject: t.procedure
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
    }),

  addUserToProject: t.procedure
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

        const res = await prisma.project.update({
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
    }),

  removeUserToProject: t.procedure
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
    }),

  createTask: t.procedure
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
    }),

  deleteTask: t.procedure
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
    }),

  updateTask: t.procedure
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
      const { id, ...updates } = input;
      const task = await prisma.task.update({
        where: { id },
        data: updates,
      });

      return task;
    }),

  createUser: t.procedure
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
        throw new Error('Error creating task');
      }
    }),
});

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});

export type AppRouter = typeof appRouter;
