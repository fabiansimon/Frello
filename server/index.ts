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
} from './controllers/projectController';
import {
  createTask,
  deleteTask,
  updateTask,
} from './controllers/taskController';
import {
  createComment,
  removeComment,
  fetchComments,
} from './controllers/commentController';
import { loginUser, registerUser } from './controllers/userController';
import { Context, router } from './trpc';

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
  registerUser,
  loginUser,
  fetchComments,
  createComment,
  removeComment,
});

const app = express();

app.use(cors());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req }): Promise<Context> => {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return null;
      }

      const token = authHeader.split(' ')[1];
      try {
        return verifyToken(token) as Context;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  })
);

app.listen(4000, () => {
  console.log('Server running on port 4000');
});

export type AppRouter = typeof appRouter;
