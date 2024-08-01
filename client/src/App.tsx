import { useMemo } from 'react';
import './App.css';
import Navbar from './components/NavBar';
import { Task } from '@prisma/client';
import { generateId } from './lib/utils';
import { BreakPoint, PopulatedStatusType, StatusType } from './lib';
import useBreakingPoints from './hooks/useBreakingPoint';
import TaskColumn from './components/TaskColumn';
import UserTaskSheet from './components/UserTasksSheet';
import { FILTER_BY_STATUS, TASK_STATUS } from './constants/TaskStatus';
import { trpc } from './trpc';

// const tasks: Task[] = Array.from({ length: 14 }, (_, index) => ({
//   assigneeId: generateId(),
//   createdAt: new Date(),
//   title: 'ChatGTP 5.0 Integration',
//   description:
//     'Integrate the new ChatGPT 5.0 version and add is as an option for the user',
//   id: generateId(),
//   projectId: generateId(),
//   status: ['InProgress', 'ToDo', 'InReview', 'Declined', 'Done'][index % 5],
//   updatedAt: new Date(),
// }));

function App() {
  const breakpointTriggered = useBreakingPoints(BreakPoint.XL);

  const { data: tasks } = trpc.fetchTasks.useQuery({
    projectId: 'example-project-id',
  });

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
    <div className="fixed flex grow max-w-full flex-col min-h-full min-w-[100%] gap-4">
      <Navbar />
      <div className="flex grow w-full justify-between">
        <div className="flex grow w-full overflow-x-auto overflow-y-hidden space-x-5 px-4 md:px-10">
          {boardCols.map((data) => (
            <TaskColumn
              key={data.id}
              data={data}
            />
          ))}
        </div>
        {!breakpointTriggered && (
          <div className="max-w-80 rounded-xl w-full bg-green-400 mx-4 mb-6" />
        )}
        <UserTaskSheet />
      </div>
    </div>
  );
}

export default App;
