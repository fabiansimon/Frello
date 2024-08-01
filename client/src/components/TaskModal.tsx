import { cn } from '@/lib/utils';
import Text from './Text';
import { Task } from '@prisma/client';

interface TaskModalProps {
  task: Task;
}

export default function TaskModal({ task }: TaskModalProps): JSX.Element {
  const {
    title,
    assigneeId,
    createdAt,
    description,
    id,
    projectId,
    status,
    updatedAt,
  } = task;
  return (
    <div
      className={cn(
        'bg-white cursor-pointer w-full md:max-w-[60%] text-start h-40 px-3 py-4 rounded-xl space-y-2'
      )}
    >
      <Text.Headline className="text-black font-medium text-[15px]">
        {title}
      </Text.Headline>
      <Text.Body className="text-black/60">{description}</Text.Body>
    </div>
  );
}
