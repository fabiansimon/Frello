import { Task } from '@prisma/client';
import { StatusType } from '@/lib';

export const TASK_STATUS: Record<string, StatusType> = {
  ToDo: {
    id: 'ToDo',
    color: 'bg-blue-500',
    title: 'To Do',
  },
  InProgress: {
    id: 'InProgress',
    color: 'bg-yellow-500',
    title: 'In Progress',
  },
  InReview: {
    id: 'InReview',
    color: 'bg-purple-500',
    title: 'In Review',
  },
  Done: {
    id: 'Done',
    color: 'bg-green-500',
    title: 'Done',
  },
  Declined: {
    id: 'Declined',
    color: 'bg-red-500',
    title: 'Declined',
  },
};
export function FILTER_BY_STATUS(type: string) {
  return (task: Task) => task.status === type;
}
