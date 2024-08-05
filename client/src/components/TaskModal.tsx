import { cn, getDateDifference } from '@/lib/utils';
import Text from './Text';
import { TaskStatus, Comment, User } from '@prisma/client';
import StatusChip from './StatusChip';
import { TASK_STATUS } from '@/constants/TaskStatus';
import { useProjectContext } from '@/providers/projectProvider';
import { useEffect, useMemo, useState } from 'react';
import ModalController from '@/controllers/ModalController';
import AlertController from '@/controllers/AlertController';
import InputTaskModal from './InputTaskModal';
import AssigneeContainer from './AssigneeContainer';
import useKeyShortcut from '@/hooks/useKeyShortcut';
import { trpc } from '@/trpc';
import ToastController from '@/controllers/ToastController';
import { useUserContext } from '@/providers/userProvider';
import { Delete01Icon } from 'hugeicons-react';

interface CommentsContainerProps {
  comments: Comment[];
  isLoading: boolean;
  onDelete: (commentId: string) => void;
  users: Map<string, User>;
  className?: string;
}

interface TaskModalProps {
  taskId: string;
}

export default function TaskModal({ taskId }: TaskModalProps): JSX.Element {
  const { deleteTask, updateTask, tasks, users, project } = useProjectContext();
  const { user } = useUserContext();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [input, setInput] = useState<string>('');

  const {
    data,
    error,
    isLoading: commentsLoading,
  } = trpc.fetchComments.useQuery({ taskId });

  // Comment mutations
  const _createComment = trpc.createComment.useMutation();
  const _removeComment = trpc.removeComment.useMutation();

  const task = useMemo(() => tasks.find((t) => t.id === taskId), [tasks]);

  const { deletable, editable } = useMemo(() => {
    const isAdmin = project?.adminId === user?.id;
    return {
      deletable: isAdmin,
      editable: isAdmin || task?.assigneeId === user?.id,
    };
  }, [task, user, project]);

  const { title, description } = task!;

  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  useEffect(() => {
    if (!data) return;
    setComments(data);
  }, [data]);

  const handleEdit = () => {
    setIsEdit(true);
  };

  const sendMessage = async () => {
    if (input.trim().length === 0)
      return ToastController.showErrorToast({
        title: 'Empty message cannot be sent.',
      });

    if (!project) return;
    const comment = await _createComment.mutateAsync({
      projectId: project.id,
      taskId,
      text: input,
    });

    setComments((prev) => prev.concat(comment));
    setInput('');
  };

  const handleDelete = () => {
    AlertController.show({ callback: async () => await deleteTask(taskId) });
    ModalController.close();
  };

  const handleStatusUpdate = async (status: TaskStatus) => {
    setIsLoading(true);
    await updateTask({
      updates: { status },
      taskId,
    });
    setIsLoading(false);
    ModalController.close();
  };

  const handleCommentDeletion = (commentId: string) => {
    AlertController.show({
      title: 'Delete comment?',
      description: 'Are you sure?',
      callback: async () => deleteComment(commentId),
    });
  };

  const deleteComment = async (commentId: string) => {
    if (!project) return;
    try {
      await _removeComment.mutateAsync({
        commentId,
        projectId: project.id,
      });
      setComments((prev) => prev.filter(({ id }) => id !== commentId));
    } catch (error) {
      const errorMessage = (error as Error).message;
      ToastController.showErrorToast({ description: errorMessage });
    }
  };

  useKeyShortcut({ hotkey: 'Enter', action: sendMessage });

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
        'bg-white relative w-full md:max-w-screen-md text-start min-h-40 px-3 py-4 rounded-xl space-y-2 flex flex-col'
      )}
    >
      <Text.Headline className="text-black font-medium text-[15px]">
        {title}
      </Text.Headline>
      <Text.Body className="text-black/60 max-w-[70%]">{description}</Text.Body>
      <AssigneeContainer
        assigneeId={task?.assigneeId || ''}
        className="mr-auto"
      />
      <div className="divider" />
      <Text.Body>{`Comments (${comments.length})`}</Text.Body>
      <CommentsContainer
        onDelete={handleCommentDeletion}
        users={users}
        isLoading={commentsLoading}
        className="max-h-52 overflow-y-auto"
        comments={comments}
      />
      <input
        onInput={({ currentTarget: { value } }) => setInput(value)}
        value={input}
        type="text"
        className="input text-sm h-11 bg-white text-black input-bordered w-full"
        placeholder="Comment (Press enter to send)"
      />

      {editable && deletable && <div className="divider" />}
      <div className="flex w-full space-x-2">
        {editable && (
          <button
            onClick={handleEdit}
            className="btn grow btn-outline"
          >
            <Text.Subtitle>Edit</Text.Subtitle>
          </button>
        )}
        {deletable && (
          <button
            onClick={handleDelete}
            className="btn btn-error grow"
          >
            <Text.Subtitle className="text-white">Delete</Text.Subtitle>
          </button>
        )}
      </div>
      <StatusChip
        isLoading={isLoading}
        onSelect={editable ? handleStatusUpdate : undefined}
        className="absolute right-4 top-1"
        status={task?.status ? TASK_STATUS[task.status] : TASK_STATUS.ToDo}
      />
    </div>
  );
}

function CommentsContainer({
  comments,
  isLoading,
  onDelete,
  className,
  users,
}: CommentsContainerProps): JSX.Element {
  return (
    <div
      className={cn(
        'bg-neutral-100 rounded-lg p-2 space-y-5 flex justify-center flex-col',
        className
      )}
    >
      {isLoading && <span className="text-black/60 loading size-4" />}
      {comments.length === 0 && !isLoading && (
        <Text.Subtitle className="text-black/60 my-1 text-center">
          No comments added yet.
        </Text.Subtitle>
      )}
      {comments.map(({ content, id, userId, createdAt }) => {
        const { text } = getDateDifference(createdAt);
        const authored = `by ${users.get(userId)?.name} • ${text}`;
        return (
          <div
            className="w-full flex justify-between items-center"
            key={id}
          >
            <div className="space-y-1">
              <Text.Body>{content}</Text.Body>
              <Text.Subtitle className="text-black/40">
                {authored}
              </Text.Subtitle>
            </div>
            <div
              onClick={() => onDelete(id)}
              className="border border-error/20 rounded-full p-2 cursor-pointer"
            >
              <Delete01Icon
                className="text-error"
                size={15}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
