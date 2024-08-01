import ModalController from '@/controllers/ModalController';
import InputTaskModal from './InputTaskModal';
import Text from './Text';
import { Add01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import TaskContainer from './TaskContainer';
import { PopulatedStatusType } from '@/lib';

interface TaskColumnProps {
  data: PopulatedStatusType;
  className?: string;
}

export default function TaskColumn({
  data,
  className,
}: TaskColumnProps): JSX.Element {
  const handleAddTask = () => {
    ModalController.show(<InputTaskModal status={data} />);
  };

  const { title, tasks, color } = data;

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
          <TaskContainer
            task={task}
            key={task.id}
          />
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
