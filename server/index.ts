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

// Initialize Prisma Client for database interaction
export const prisma = new PrismaClient();

// Define the application router with all endpoints
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

// Create an Express application
export const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Set up tRPC middleware to handle incoming requests to /trpc endpoint
app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext: async ({ req }): Promise<Context> => {
      // Extract the authorization header from the request
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        // If no authorization header is present, return null context
        return null;
      }

      const token = authHeader.split(' ')[1];
      try {
        // Verify the token and return the user context
        return verifyToken(token) as Context;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
  })
);

// Start the Express server
(() => {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

// Export the type of the application router for type-safety
export type AppRouter = typeof appRouter;
