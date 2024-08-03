import { User } from '@prisma/client';
import OpenAI from 'openai';
import { z } from 'zod';
import { REGEX } from '../constants/regex';
import { publicProcedure } from '../trpc';
import { prisma } from '..';

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

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
  return `Take a task with following description: "${taskDescription}". Now take a look at all the possible employees to fulfill said task:\n ${userDescription}. Please pick what employee is most suitable for said taks and only answer with their ID.`;
}

export const fetchAISuggestion = publicProcedure
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
  });
