import { twMerge } from 'tailwind-merge';
import { type ClassValue, clsx } from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '@prisma/client';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function pluralize(amount: number, post: string) {
  return `${amount || 'no'} ${post}${amount > 1 || amount === 0 ? 's' : ''}`;
}

export function generateId() {
  return uuidv4();
}

export function getReadableDate(date?: Date, short: boolean = false) {
  const now = date ? new Date(date) : new Date();

  const shortOptions = {
    year: 'numeric' as 'numeric',
    month: 'short' as 'short',
    day: 'numeric' as 'numeric',
  };

  const options = {
    weekday: 'short' as 'short',
    year: 'numeric' as 'numeric',
    month: 'short' as 'short',
    day: 'numeric' as 'numeric',
    hour: '2-digit' as '2-digit',
    minute: '2-digit' as '2-digit',
    hour12: true,
  };
  return now.toLocaleDateString('en-US', short ? shortOptions : options);
}

export function getDateDifference(date: Date) {
  const now = new Date();
  const difference = now.getTime() - new Date(date).getTime();

  const units = [
    { name: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { name: 'month', value: 30 * 24 * 60 * 60 * 1000 },
    { name: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { name: 'day', value: 24 * 60 * 60 * 1000 },
    { name: 'hour', value: 60 * 60 * 1000 },
    { name: 'minute', value: 60 * 1000 },
    { name: 'second', value: 1000 },
  ];

  for (const unit of units) {
    const amount = Math.floor(difference / unit.value);
    if (amount >= 1) {
      return {
        text: `${amount} ${unit.name}${amount > 1 ? 's' : ''} ago`,
        unit: unit.name,
      };
    }
  }

  return {
    text: 'just now',
    unit: 'seconds',
  };
}
