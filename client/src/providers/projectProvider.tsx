import { route, ROUTES } from '@/constants/routes';
import ToastController from '@/controllers/ToastController';
import { ProjectInput, StatusType, TaskInput } from '@/lib';
import { TaskStatus } from '@prisma/client';
import { trpc } from '@/trpc';
import { Project, Task } from '@prisma/client';
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
  personalTasks: Task[];
  isLoading: boolean;
  load: (projectId: string) => Promise<void>;
  updateTask: ({ taskId, updates }: UpdateTaskProps) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createTask: (input: TaskInput) => Promise<void>;
  createProject: (input: ProjectInput) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export default function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useUserContext();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

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

  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  useEffect(() => {
    if (!data) return;
    const { tasks, project } = data;
    setProject(project);
    setTasks(tasks);
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
    personalTasks,
    isLoading,
    updateTask,
    createProject,
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
