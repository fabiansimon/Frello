export enum TaskStatus {
  ToDo = 'to-do',
  InProgress = 'in progress',
  InReview = 'in review',
  Declined = 'declined',
  Done = 'done',
}

export interface User {
  id: string;
  email: string;
  image_url?: string | null;
  role: string;
  expertise: string;
  created_at: Date;
  updated_at: Date;
}

interface Task {
  id: string;
  assigneeId?: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  users: User[];
  tasks: Task[];
  created_at: Date;
  updated_at: Date;
}

export enum BreakPoint {
  SM,
  MD,
  LG,
  XL,
  XXL,
}
