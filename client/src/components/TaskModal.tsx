import { cn } from '@/lib/utils';
import Text from './Text';
import { Task } from '@prisma/client';
import StatusChip from './StatusChip';
import { TASK_STATUS } from '@/constants/TaskStatus';

interface TaskModalProps {
  task: Task;
}

export default function TaskModal({ task }: TaskModalProps): JSX.Element {
  const { title, assigneeId, description, id, projectId, status } = task;
  return (
    <div
      className={cn(
        'bg-white relative cursor-pointer w-full md:max-w-[60%] text-start h-40 px-3 py-4 rounded-xl space-y-2'
      )}
    >
      <Text.Headline className="text-black font-medium text-[15px]">
        {title}
      </Text.Headline>
      <Text.Body className="text-black/60">{description}</Text.Body>
      <StatusChip
        className="absolute right-4 top-1"
        status={TASK_STATUS[task.status]}
      />
    </div>
  );
}
