import { Task, User, TaskStatus } from '@prisma/client';

export enum BreakPoint {
  SM,
  MD,
  LG,
  XL,
  XXL,
}

export interface StatusType {
  id: TaskStatus;
  color: string;
  title: string;
}

export interface PopulatedStatusType extends StatusType {
  tasks: Task[];
}

export enum ToastType {
  ERROR,
  WARNING,
  SUCCESS,
}

export interface AuthInput {
  name: string;
  email: string;
  expertise: string;
  role: string;
}

export interface ProjectInput {
  title: string;
  description: string;
}

export interface TaskInput {
  title: string;
  description: string;
  status: StatusType;
  assigneeId: string;
}

export interface Comment {
  text: string;
  createdAt: Date;
  author: string;
}

export interface AuthUser extends User {
  jwt: string;
}

export enum OperationSystem {
  WINDOWS,
  MAC,
  LINUX,
  IOS,
  ANDROID,
  MISC,
}
