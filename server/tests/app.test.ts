import { appRouter } from '../index';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prismaMock = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(prismaMock);
});

describe('User Tests', () => {
  const email = `${uuidv4()}@example.com`;

  const caller = appRouter.createCaller({
    session: null,
    prisma: prismaMock,
  });
  test('Register user test', async () => {
    const input = {
      email,
      expertise: 'Testing Robust Software',
      name: 'Tester Name',
      role: 'QA Tester',
    };

    const result = await caller.registerUser(input);

    expect(result.user.email).toBe(input.email);
    expect(result.user.name).toBe(input.name);
    expect(result.user.expertise).toBe(input.expertise);
    expect(result.user.role).toBe(input.role);
  });

  test('Login user test', async () => {
    const input = {
      email,
    };

    const result = await caller.loginUser(input);

    expect(result.user.email).toBe(input.email);
  });
});
