import Navbar from '@/components/NavBar';
import TaskColumn from '@/components/TaskColumn';
import TaskModal from '@/components/TaskModal';
import TaskOverview from '@/components/TaskOverview';
import { FILTER_BY_STATUS, TASK_STATUS } from '@/constants/TaskStatus';
import ModalController from '@/controllers/ModalController';
import { PopulatedStatusType } from '@/lib';
import { useProjectContext } from '@/providers/projectProvider';
import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function ProjectPage() {
  const { tasks, load } = useProjectContext();
  const [searchParams] = useSearchParams();
  const { projectId } = useParams();

  // Load project data when projectId changes
  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  // Show TaskModal if selectedTask is in search parameters
  useEffect(() => {
    const selectedTask = searchParams.get('selectedTask');
    if (!selectedTask || !tasks.find((t) => t.id === selectedTask)) return;
    ModalController.show(<TaskModal taskId={selectedTask} />);
  }, [searchParams, tasks]);

  // Filter tasks by status
  const filteredTasks = useMemo(() => {
    return {
      progressTasks: tasks ? tasks.filter(FILTER_BY_STATUS('InProgress')) : [],
      toDoTasks: tasks ? tasks.filter(FILTER_BY_STATUS('ToDo')) : [],
      reviewTasks: tasks ? tasks.filter(FILTER_BY_STATUS('InReview')) : [],
      declinedTasks: tasks ? tasks.filter(FILTER_BY_STATUS('Declined')) : [],
      doneTasks: tasks ? tasks.filter(FILTER_BY_STATUS('Done')) : [],
    };
  }, [tasks]);

  // Populate board columns with tasks by status
  const boardCols: PopulatedStatusType[] = useMemo(() => {
    const { progressTasks, toDoTasks, reviewTasks, declinedTasks, doneTasks } =
      filteredTasks;

    return [
      {
        ...TASK_STATUS.ToDo,
        tasks: toDoTasks,
      },
      {
        ...TASK_STATUS.InProgress,
        tasks: progressTasks,
      },
      {
        ...TASK_STATUS.InReview,
        tasks: reviewTasks,
      },
      {
        ...TASK_STATUS.Declined,
        tasks: declinedTasks,
      },
      {
        ...TASK_STATUS.Done,
        tasks: doneTasks,
      },
    ];
  }, [filteredTasks]);

  return (
    <div className="fixed flex grow max-w-full max-h-full flex-col min-h-[100%] min-w-[100%] gap-4">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Screen */}
      <div className="flex grow w-full justify-between">
        <div className="flex grow w-full overflow-x-auto overflow-y-hidden space-x-5 pr-[370px] pl-4 md:pl-10">
          {boardCols.map((data) => (
            <TaskColumn
              key={data.id}
              data={data}
            />
          ))}
        </div>

        {/* Side Task Overview */}
        <TaskOverview data={boardCols} />
      </div>
    </div>
  );
}
