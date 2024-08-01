import { Task } from '@prisma/client';

export enum BreakPoint {
  SM,
  MD,
  LG,
  XL,
  XXL,
}

export interface StatusType {
  id: string;
  color: string;
  title: string;
}

export type PopulatedStatusType = StatusType & { tasks: Task[] };

export enum ToastType {
  ERROR,
  WARNING,
  SUCCESS,
}
