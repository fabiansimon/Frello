import { route, ROUTES } from '@/constants/routes';
import ToastController from '@/controllers/ToastController';
import { ProjectInput, TaskInput } from '@/lib';
import { TaskStatus } from '@prisma/client';
import { trpc } from '@/trpc';
import { Project, Task, User } from '@prisma/client';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { TASK_STATUS } from '@/constants/TaskStatus';
import { useUserContext } from './userProvider';
import { REGEX } from '@/constants/regex';

interface UpdateTaskProps {
  taskId: string;
  updates: Partial<{
    title: string;
    description: string;
    assigneeId: string | null;
    status: TaskStatus;
  }>;
}

interface ProjectContextType {
  project: Project | null;
  tasks: Task[];
  users: Map<string, User>;
  personalTasks: Task[];
  isLoading: boolean;
  load: (projectId: string) => Promise<void>;
  updateTask: ({ taskId, updates }: UpdateTaskProps) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createTask: (input: TaskInput) => Promise<void>;
  addUser: (email: string) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  createProject: (input: ProjectInput) => Promise<void>;
  fetchTaskSuggestion: (taskId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useUserContext();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());

  const navigation = useNavigate();

  // Queries
  const { data, isLoading, error } = trpc.fetchProject.useQuery(
    { projectId: projectId as string },
    { enabled: !!projectId }
  );

  // Mutations
  const _createProject = trpc.createProject.useMutation();
  const _createTask = trpc.createTask.useMutation();
  const _deleteTask = trpc.deleteTask.useMutation();
  const _updateTask = trpc.updateTask.useMutation();
  const _addUserToProject = trpc.addUserToProject.useMutation();
  const _removeUserToProject = trpc.removeUserToProject.useMutation();

  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  useEffect(() => {
    if (!data) return;
    const { tasks, project, users } = data;
    setProject(project);
    setTasks(tasks);
    setUsers(() => {
      const userMap = new Map<string, User>();
      users.forEach((user) => userMap.set(user.id, user));
      return userMap;
    });
  }, [data]);

  const personalTasks = useMemo(
    () => tasks.filter((task) => task.assigneeId === user?.id),
    [tasks, user]
  );

  const load = useCallback(
    async (projectId: string) => setProjectId(projectId),
    []
  );

  const updateTask = useCallback(
    async ({ taskId, updates }: UpdateTaskProps) => {
      try {
        await _updateTask.mutateAsync({
          id: taskId,
          ...updates,
        });
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
      } catch (error) {
        console.error(error);
        ToastController.showErrorToast({
          description: (error as Error).message,
        });
      }
    },
    []
  );

  const createProject = useCallback(async (input: ProjectInput) => {
    const { title, description } = input;
    try {
      const _project = await _createProject.mutateAsync({
        description,
        title,
      });
      setProject(_project);
      navigation(route(ROUTES.project, _project.id));
    } catch (error) {
      console.error(error);
      ToastController.showErrorToast({ description: error.message });
    }
  }, []);

  const addUser = useCallback(
    async (email: string) => {
      if (!project) return;
      try {
        const user = await _addUserToProject.mutateAsync({
          email,
          projectId: project.id,
        });
        setUsers((prev) => {
          const userMap = new Map(prev);
          userMap.set(user.id, user);
          return userMap;
        });
      } catch (error) {
        console.error(error);
        ToastController.showErrorToast({ description: error.message });
      }
    },
    [project]
  );

  const removeUser = useCallback(
    async (userId: string) => {
      if (!project) return;
      try {
        await _removeUserToProject.mutateAsync({
          userId,
          projectId: project.id,
        });
        setUsers((prev) => {
          const userMap = new Map(prev);
          userMap.delete(userId);
          return userMap;
        });
      } catch (error) {
        console.error(error);
        ToastController.showErrorToast({ description: error.message });
      }
    },
    [project]
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await _deleteTask.mutateAsync({ taskId });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error(error);
      ToastController.showErrorToast({ description: error.message });
    }
  }, []);

  const createTask = useCallback(
    async (input: TaskInput) => {
      if (!project) return;
      const { title, description, status, assigneeId } = input;
      try {
        const _task = await _createTask.mutateAsync({
          description,
          title,
          projectId: project.id,
          status: status.id as TaskStatus,
          assigneeId,
        });
        setTasks((prev) => prev.concat(_task));
      } catch (error) {
        console.error(error);
        ToastController.showErrorToast({ description: error.message });
      }
    },
    [project]
  );

  const value = {
    project,
    tasks,
    users,
    personalTasks,
    isLoading,
    updateTask,
    createProject,
    addUser,
    removeUser,
    deleteTask,
    createTask,
    load,
  };
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }

  return context;
}
