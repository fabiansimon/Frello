import { User } from '@prisma/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAPI_KEY,
});

export async function getOpenAISuggestion({
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
