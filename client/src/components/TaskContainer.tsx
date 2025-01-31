import { cn, getDateDifference, getReadableDate } from '@/lib/utils';
import { Task } from '@prisma/client';
import Text from './Text';
import ModalController from '@/controllers/ModalController';
import TaskModal from './TaskModal';
import StatusChip from './StatusChip';
import { TASK_STATUS } from '@/constants/TaskStatus';
import { StatusType } from '@/lib';
import AssigneeContainer from './AssigneeContainer';

interface TaskContainerProps {
  task: Task;
  showStatus?: boolean;
  className?: string;
}

export default function TaskContainer({
  task,
  className,
  showStatus,
}: TaskContainerProps): JSX.Element {
  const { description, title, status, createdAt, assigneeId } = task;
  const { text: differenceText, unit } = getDateDifference(createdAt);

  return (
    <div
      onClick={() => ModalController.show(<TaskModal taskId={task.id} />)}
      className={cn(
        'bg-white cursor-pointer text-start px-3 py-4 rounded-xl space-y-2 hover:scale-[102%] transition duration-100 ease-in-out transform',
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
      <Text.Body className="text-black/60 max-w-[80%]">{description}</Text.Body>

      {!showStatus && (
        <>
          <div className="divider" />
          <AssigneeContainer assigneeId={assigneeId || ''} />
        </>
      )}

      {showStatus && (
        <StatusChip
          minimalistic
          status={TASK_STATUS[status] as StatusType}
          className="min-w-8 max-w-8 absolute bottom-2 right-2"
        />
      )}
    </div>
  );
}
