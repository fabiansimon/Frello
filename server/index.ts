import { initTRPC } from '@trpc/server';
import cors from 'cors';
import express from 'express';
import { z } from 'zod';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const t = initTRPC.create();

const appRouter = t.router({
  fetchTasks: t.procedure
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
          include: {
            Project: true,
          },
        });

        return tasks;
      } catch (error) {
        throw new Error('Error creating task');
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
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return task;
      } catch (error) {
        throw new Error('Error creating task');
      }
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
            createdAt: new Date(),
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
