import { cn, getDateDifference, getReadableDate } from '@/lib/utils';
import { Task } from '@prisma/client';
import Text from './Text';
import ModalController from '@/controllers/ModalController';
import TaskModal from './TaskModal';

interface TaskContainerProps {
  task: Task;
  className?: string;
}

export default function TaskContainer({
  task,
  className,
}: TaskContainerProps): JSX.Element {
  const { description, title, status, created_at } = task;
  const { text: differenceText, unit } = getDateDifference(created_at);

  return (
    <div
      onClick={() => ModalController.show(<TaskModal task={task} />)}
      className={cn(
        'bg-white cursor-pointer text-start px-3 py-4 rounded-xl space-y-2 hover:scale-[102%] transition duration-100 ease-in-out transform',
        className
      )}
    >
      <div className="border-b border-black/10 pb-2 flex justify-between items-center -mt-2">
        <Text.Subtitle className="text-black">
          {getReadableDate(created_at, true)}
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
