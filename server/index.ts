import cors from 'cors';
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from './utils/jwt';
import { fetchAISuggestion } from './controllers/openAIController';
import {
  addUserToProject,
  createProject,
  deleteProject,
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

export const appRouter = router({
  fetchUserProjects,
  fetchProject,
  fetchAISuggestion,
  createProject,
  deleteProject,
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

export const app = express();

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

(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

export type AppRouter = typeof appRouter;
