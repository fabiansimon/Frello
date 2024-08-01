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

export interface Task {
  id: string;
  created_at: Date;
  updated_at: Date;
  assignee?: User | null;
  title: string;
  description: string;
  status: TaskStatus;
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
