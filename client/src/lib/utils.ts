import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '.';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function pluralize(amount: number, post: string) {
  return `${amount || 'no'} ${post}${amount > 1 || amount === 0 ? 's' : ''}`;
}

export function generateId() {
  return uuidv4();
}

export function FILTER_BY_STATUS(type: string) {
  return (task: Task) => task.status === type;
}
