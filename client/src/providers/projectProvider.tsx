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
} from 'react';
import { useNavigate } from 'react-router-dom';
import { TASK_STATUS } from '@/constants/TaskStatus';

interface UpdateTaskStatusProps {
  taskId: string;
  status: StatusType;
}

interface ProjectContextType {
  project: Project | null;
  tasks: Task[];
  isLoading: boolean;
  load: (projectId: string) => Promise<void>;
  updateTaskStatus: ({
    taskId,
    status,
  }: UpdateTaskStatusProps) => Promise<void>;
  createProject: (input: ProjectInput) => Promise<void>;
  createTask: (input: TaskInput) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export default function ProjectProvider({ children }: { children: ReactNode }) {
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

  const load = useCallback(
    async (projectId: string) => setProjectId(projectId),
    []
  );

  const updateTaskStatus = useCallback(
    async ({ taskId, status }: UpdateTaskStatusProps) => {
      try {
        await _updateTask.mutateAsync({
          id: taskId,
          status: TASK_STATUS[status.id].id as TaskStatus,
        });
        setTasks((prev) =>
          prev.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                status: TASK_STATUS[status.id].id as TaskStatus,
              };
            }
            return task;
          })
        );
      } catch (error) {
        console.error(error);
        ToastController.showErrorToast({ description: error.message });
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
    isLoading,
    updateTaskStatus,
    createProject,
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
