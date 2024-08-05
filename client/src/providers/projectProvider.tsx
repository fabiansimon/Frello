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
}

// Create a context for the project
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
  const _removeUserFromProject = trpc.removeUserFromProject.useMutation();

  // Handle errors by displaying a toast notification
  const handleError = (error: unknown) => {
    const errorMessage = (error as Error).message;
    console.error(error);
    ToastController.showErrorToast({ description: errorMessage });
  };

  // Show error toast if an error by the query occures
  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  // Update state when project data from query changes
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

  // Assigned Tasks to authenticated user
  const personalTasks = useMemo(
    () => tasks.filter((task) => task.assigneeId === user?.id),
    [tasks, user]
  );

  // Load a project by ID
  const load = useCallback(
    async (projectId: string) => setProjectId(projectId),
    []
  );

  // Update a task in the project
  const updateTask = useCallback(
    async ({ taskId, updates }: UpdateTaskProps) => {
      if (!project) return;
      try {
        await _updateTask.mutateAsync({
          id: taskId,
          projectId: project.id,
          ...updates,
        });
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        );
      } catch (error) {
        handleError(error);
      }
    },
    [project]
  );

  // Create a new project
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
      handleError(error);
    }
  }, []);

  // Add a user to the project
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
        handleError(error);
      }
    },
    [project]
  );

  // Remove a user from the project
  const removeUser = useCallback(
    async (userId: string) => {
      if (!project) return;
      try {
        await _removeUserFromProject.mutateAsync({
          userId,
          projectId: project.id,
        });
        setUsers((prev) => {
          const userMap = new Map(prev);
          userMap.delete(userId);
          return userMap;
        });
      } catch (error) {
        handleError(error);
      }
    },
    [project]
  );

  // Delete a task from the project
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await _deleteTask.mutateAsync({ taskId });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Create a new task in the project
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
        handleError(error);
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

// Hook to use the Project context
export function useProjectContext() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }

  return context;
}
