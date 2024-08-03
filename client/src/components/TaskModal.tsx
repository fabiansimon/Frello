import { cn } from '@/lib/utils';
import Text from './Text';
import { TaskStatus } from '@prisma/client';
import StatusChip from './StatusChip';
import { TASK_STATUS } from '@/constants/TaskStatus';
import { useProjectContext } from '@/providers/projectProvider';
import { Comment, StatusType } from '@/lib';
import { useMemo, useState } from 'react';
import ModalController from '@/controllers/ModalController';
import AlertController from '@/controllers/AlertController';
import InputTaskModal from './InputTaskModal';

interface CommentsContainerProps {
  comments: Comment[];
  className?: string;
}

interface TaskModalProps {
  taskId: string;
}

export default function TaskModal({ taskId }: TaskModalProps): JSX.Element {
  const { deleteTask, tasks } = useProjectContext();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');

  const { updateTask } = useProjectContext();
  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks]);

  const { title, description, status } = task!;

  const comments: Comment[] = [
    {
      text: 'Lorem ipusm bal sadjöaj eusje soe',
      author: 'Elisabeth Altmutter',
      createdAt: new Date(),
    },
    {
      text: 'Lorem ipusm bal sadjöaj eusje soe',
      author: 'Elisabeth Altmutter',
      createdAt: new Date(),
    },
    {
      text: 'Lorem ipusm bal sadjöaj eusje soe',
      author: 'Elisabeth Altmutter',
      createdAt: new Date(),
    },
    {
      text: 'Lorem ipusm bal sadjöaj eusje soe',
      author: 'Elisabeth Altmutter',
      createdAt: new Date(),
    },
  ];

  const handleEdit = () => {
    setIsEdit(true);
  };

  const handleDelete = () => {
    AlertController.show({ callback: async () => await deleteTask(taskId) });
    ModalController.close();
  };

  const handleStatusUpdate = async (status: StatusType) => {
    setIsLoading(true);
    await updateTask({
      status: TASK_STATUS[status.id].id as TaskStatus,
      taskId,
    });
    setIsLoading(false);
    ModalController.close();
  };

  if (isEdit)
    return (
      <InputTaskModal
        task={task}
        onRequestClose={() => setIsEdit(false)}
      />
    );

  return (
    <div
      className={cn(
        'bg-white relative cursor-pointer w-full md:max-w-screen-md text-start min-h-40 px-3 py-4 rounded-xl space-y-2'
      )}
    >
      <Text.Headline className="text-black font-medium text-[15px]">
        {title}
      </Text.Headline>
      <Text.Body className="text-black/60">{description}</Text.Body>
      {/* <div className="divider" />
      <Text.Body>Comments</Text.Body>
      <CommentsContainer
        className="max-h-52 overflow-y-auto"
        comments={comments}
      />
      <input
        onInput={({ currentTarget: { value } }) => setComment(value)}
        value={comment}
        type="text"
        className="input text-sm h-11 bg-white text-black input-bordered w-full"
        placeholder="Comment"
      /> */}
      <div className="divider" />
      <div className="flex w-full space-x-2">
        <button
          onClick={handleEdit}
          className="btn grow btn-outline"
        >
          <Text.Subtitle>Edit</Text.Subtitle>
        </button>
        <button
          onClick={handleDelete}
          className="btn btn-error grow"
        >
          <Text.Subtitle className="text-white">Delete</Text.Subtitle>
        </button>
      </div>
      <StatusChip
        isLoading={isLoading}
        onSelect={handleStatusUpdate}
        className="absolute right-4 top-1"
        status={TASK_STATUS[task.status]}
      />
    </div>
  );
}

function CommentsContainer({
  comments,
  className,
}: CommentsContainerProps): JSX.Element {
  return (
    <div className={cn('bg-neutral-100 rounded-lg p-2 space-y-5', className)}>
      {comments.map(({ author, createdAt, text }) => (
        <div
          key={author}
          className=""
        >
          <div className="space-y-1">
            <Text.Body>{text}</Text.Body>
            <Text.Subtitle className="text-black/40">{`by ${author}`}</Text.Subtitle>
          </div>
        </div>
      ))}
    </div>
  );
}
