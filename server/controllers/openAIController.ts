import { User } from '@prisma/client';
import OpenAI from 'openai';
import { z } from 'zod';
import { REGEX } from '../constants/regex';
import { protectedProcedure } from '../trpc';
import { prisma } from '..';

// Initialize OpenAI with the provided API key
const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

// Function to get AI suggestion for task assignment
async function getOpenAISuggestion({
  users,
  taskDescription,
}: {
  users: User[];
  taskDescription: string;
}) {
  const prompt = generateSuggestionPrompt({ users, taskDescription });
  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert Product Manager. You will get the context of a task and a list of users with their respective expertise and choose which user is most suitable for that task.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return res.choices[0].message.content;
}

// Function to generate the prompt for AI based on users and task description
function generateSuggestionPrompt({
  users,
  taskDescription,
}: {
  users: User[];
  taskDescription: string;
}) {
  const userDescription = users.reduce((acc, { id, expertise, role }) => {
    return acc + `• ID: ${id}; Role: ${role}; Expertise: "${expertise}\n"`;
  }, '');
  return `Take a task with the following description: "${taskDescription}". Now take a look at all the possible employees to fulfill said task:\n ${userDescription}. Please pick the employee who is most suitable for the task and only answer with their ID.`;
}

// Procedure to fetch AI suggestion for task assignment
export const fetchAISuggestion = protectedProcedure
  .input(
    z.object({
      projectId: z.string(),
      taskDescription: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { projectId, taskDescription } = input;

    try {
      // Fetch the project along with its users
      const data = await prisma.project.findFirst({
        where: {
          id: projectId,
        },
        include: {
          users: true,
        },
      });

      // Check if the project exists
      if (!data)
        throw new Error('No project found with the provided project ID.');

      const { users } = data;

      // Get AI suggestion for task assignment
      const suggestion = await getOpenAISuggestion({
        users,
        taskDescription,
      });

      // Validate the AI suggestion
      if (!suggestion || !REGEX.uuid.test(suggestion))
        throw new Error(
          'Invalid AI suggestion received. Please try again later.'
        );

      return { userId: suggestion };
    } catch (error) {
      console.error('Error fetching AI Suggestion:', error);
      throw error;
    }
  });
