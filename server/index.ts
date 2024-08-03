import { initTRPC } from '@trpc/server';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';

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
        const tasks = await prisma.task.findMany({
          where: {
            projectId,
          },
        });

        const project = await prisma.project.findFirst({
          where: {
            id: projectId,
          },
        });

        return {
          tasks,
          project,
        };
      } catch (error) {
        console.error(error);
        throw new Error('Error fetching tasks');
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
