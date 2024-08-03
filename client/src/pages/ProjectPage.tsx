import Navbar from '@/components/NavBar';
import TaskColumn from '@/components/TaskColumn';
import TaskOverview from '@/components/TaskOverview';
import UserTaskSheet from '@/components/UserTasksSheet';
import { FILTER_BY_STATUS, TASK_STATUS } from '@/constants/TaskStatus';
import useBreakingPoints from '@/hooks/useBreakingPoint';
import { BreakPoint, PopulatedStatusType } from '@/lib';
import { useProjectContext } from '@/providers/projectProvider';
import { trpc } from '@/trpc';
import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

export default function ProjectPage() {
  const { project, tasks, load } = useProjectContext();

  const isSmall = useBreakingPoints(BreakPoint.XL);

  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) load(projectId);
  }, [projectId]);

  const filteredTasks = useMemo(() => {
    return {
      progressTasks: tasks ? tasks.filter(FILTER_BY_STATUS('InProgress')) : [],
      toDoTasks: tasks ? tasks.filter(FILTER_BY_STATUS('ToDo')) : [],
      reviewTasks: tasks ? tasks.filter(FILTER_BY_STATUS('InReview')) : [],
      declinedTasks: tasks ? tasks.filter(FILTER_BY_STATUS('Declined')) : [],
      doneTasks: tasks ? tasks.filter(FILTER_BY_STATUS('Done')) : [],
    };
  }, [tasks]);

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
      <Navbar />
      <div className="flex grow w-full justify-between">
        <div className="flex grow w-full overflow-x-auto overflow-y-hidden space-x-5 pr-[370px] pl-4 md:pl-10">
          {boardCols.map((data) => (
            <TaskColumn
              key={data.id}
              data={data}
            />
          ))}
        </div>
        {/* {isSmall && ( */}
        <TaskOverview data={boardCols} />
        {/* )} */}
        {/* <UserTaskSheet /> */}
      </div>
    </div>
  );
}
