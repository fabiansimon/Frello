import { useEffect, useMemo } from 'react';
import './App.css';
import { trpc } from './trpc';
import Navbar from './components/NavBar';
import { Task } from '@prisma/client';
import {
  cn,
  FILTER_BY_STATUS,
  generateId,
  getDateDifference,
  getReadableDate,
} from './lib/utils';
import { BreakPoint, TaskStatus } from './lib';
import { Add01Icon } from 'hugeicons-react';
import { motion } from 'framer-motion';
import useBreakingPoints from './hooks/useBreakingPoint';
import Text from './components/Text';
import ModalController from './controllers/ModalController';
import TaskModal from './components/TaskModal';
import InputTaskModal from './components/InputTaskModal';

interface TaskColumnProps {
  tasks: Task[];
  title: string;
  color: string;
  className?: string;
}

interface TaskContainerProps {
  task: Task;
  className?: string;
}

function App() {
  const breakpointTriggered = useBreakingPoints(BreakPoint.XL);

  const { data } = trpc.taskList.useQuery({ name: 'Hello' });

  const createUser = trpc.createUser.useMutation();

  useEffect(() => {
    setTimeout(() => {
      ModalController.show(<InputTaskModal />);
    }, 1000);
  }, []);

  const handleUserCreation = async () => {
    const res = await createUser.mutateAsync({
      email: 'fabian.simon98@gmail.com',
      expertise: 'UI Design, Researching new Topics and Frontend Engineering',
      role: 'Full-Stack Developer',
      image_url:
        'https://gravatar.com/avatar/0584b215b5b354d0d358b027a289c37e?s=400&d=robohash&r=x',
    });
    console.log(res);
  };

  const tasks: Task[] = Array.from({ length: 14 }, (_, index) => ({
    assigneeId: generateId(),
    createdAt: new Date(),
    title: 'ChatGTP 5.0 Integration',
    description:
      'Integrate the new ChatGPT 5.0 version and add is as an option for the user',
    id: generateId(),
    projectId: generateId(),
    status: ['InProgress', 'ToDo', 'InReview', 'Declined', 'Done'][
      index % 5
    ] as TaskStatus,
    updatedAt: new Date(),
  }));

  const filteredTasks = useMemo(() => {
    return {
      progressTasks: tasks.filter(FILTER_BY_STATUS('InProgress')),
      toDoTasks: tasks.filter(FILTER_BY_STATUS('ToDo')),
      reviewTasks: tasks.filter(FILTER_BY_STATUS('InReview')),
      declinedTasks: tasks.filter(FILTER_BY_STATUS('Declined')),
      doneTasks: tasks.filter(FILTER_BY_STATUS('Done')),
    };
  }, [tasks]);

  const boardCols = useMemo(() => {
    const { progressTasks, toDoTasks, reviewTasks, declinedTasks, doneTasks } =
      filteredTasks;
    return [
      {
        status: 'ToDo',
        color: 'bg-blue-500',
        title: 'To Do',
        tasks: toDoTasks,
      },
      {
        status: 'InProgress',
        color: 'bg-yellow-500',
        title: 'In Progress',
        tasks: progressTasks,
      },
      {
        status: 'InReview',
        color: 'bg-pink-500',
        title: 'In Review',
        tasks: reviewTasks,
      },
      {
        status: 'Declined',
        color: 'bg-red-500',
        title: 'Declined',
        tasks: declinedTasks,
      },
      {
        status: 'Done',
        color: 'bg-green-500',
        title: 'Done',
        tasks: doneTasks,
      },
    ];
  }, [filteredTasks]);

  return (
    <div className="fixed flex grow max-w-full flex-col min-h-full min-w-[100%] gap-4">
      <Navbar />
      <div className="flex grow w-full justify-between">
        <div className="flex grow w-full overflow-x-auto overflow-y-hidden space-x-5 px-4 md:px-10">
          {boardCols.map(({ status, color, title, tasks }) => (
            <TaskColumn
              key={status}
              color={color}
              title={title}
              tasks={tasks}
            />
          ))}
        </div>
        <motion.div
          initial="hidden"
          variants={{
            hidden: { translateY: '80%' },
            visible: { translateY: 0 },
          }}
          className="absolute rounded-xl bottom-0 right-0 left-0 xl:right-20 xl:left-20 bg-white h-[90%]"
        ></motion.div>
        {!breakpointTriggered && (
          <div className="max-w-80 rounded-xl w-full bg-green-400 mx-4 mb-6" />
        )}
      </div>
    </div>
  );
}

function TaskColumn({
  tasks,
  title,
  color,
  className,
}: TaskColumnProps): JSX.Element {
  const handleAddTask = () => {
    ModalController.show(<InputTaskModal />);
  };
  return (
    <div className={cn('min-w-72 space-y-3', className)}>
      <div className="flex justify-between items-end">
        <Text.Body className="font-medium text-white">{title}</Text.Body>
        <div
          onClick={handleAddTask}
          className="rounded-full cursor-pointer h-8 w-8 flex items-center justify-center bg-black/10"
        >
          <Add01Icon
            className="text-white"
            size={14}
          />
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col p-3 grow space-y-4 h-full rounded-xl shadow-sm shadow-black/10',
          color
        )}
      >
        {tasks.map((task) => (
          <TaskContainer task={task} />
        ))}
        <div
          onClick={handleAddTask}
          className="rounded-full cursor-pointer h-8 w-8 flex items-center justify-center bg-black/10"
        >
          <Add01Icon
            className="text-white"
            size={14}
          />
        </div>
      </div>
    </div>
  );
}

function TaskContainer({ task, className }: TaskContainerProps): JSX.Element {
  const { createdAt, description, title, status, updatedAt } = task;
  const { text: differenceText, unit } = getDateDifference(createdAt);

  return (
    <div
      onClick={() => ModalController.show(<TaskModal task={task} />)}
      className={cn(
        'bg-white cursor-pointer text-start h-40 px-3 py-4 rounded-xl space-y-2 hover:scale-[102%] transition duration-100 ease-in-out transform',
        className
      )}
    >
      <div className="border-b border-black/10 pb-2 flex justify-between items-center -mt-2">
        <Text.Subtitle className="text-black">
          {getReadableDate(createdAt, true)}
        </Text.Subtitle>
        <div
          className={cn(
            'rounded-md px-2 py-1',
            unit === 'day' ? 'bg-error/30' : 'bg-success/40'
          )}
        >
          <Text.Subtitle
            className={cn(unit === 'day' ? 'text-error' : 'text-success')}
          >
            {differenceText}
          </Text.Subtitle>
        </div>
      </div>
      <Text.Headline className="text-black pt-1 font-medium text-[15px]">
        {title}
      </Text.Headline>
      <Text.Body className="text-black/60">{description}</Text.Body>
    </div>
  );
}

export default App;
