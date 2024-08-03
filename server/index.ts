import cors from 'cors';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './utils/jwt';
import { fetchAISuggestion } from './controllers/openAIController';
import {
  addUserToProject,
  createProject,
  fetchProject,
  fetchUserProjects,
  removeUserFromProject,
} from './controllers/projectsController';
import {
  createTask,
  createUser,
  deleteTask,
  updateTask,
} from './controllers/taskController';
import { router } from './trpc';

export const prisma = new PrismaClient();

const appRouter = router({
  fetchUserProjects,
  fetchProject,
  fetchAISuggestion,
  createProject,
  addUserToProject,
  removeUserFromProject,
  createTask,
  deleteTask,
  updateTask,
  createUser,
});

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req }) => {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return { user: null };
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token);
        return { user: decoded };
      } catch (error) {
        console.error(error);
        return { user: null };
      }
    },
  })
);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});

export type AppRouter = typeof appRouter;
