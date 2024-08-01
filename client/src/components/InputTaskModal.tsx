import { cn } from '@/lib/utils';
import Text from './Text';
import { Task, TaskStatus } from '@prisma/client';
import { useMemo, useState } from 'react';
import { trpc } from '@/trpc';
import StatusChip from './StatusChip';
import { StatusType } from '@/lib';
import { TASK_STATUS } from '@/constants/TaskStatus';
import ModalController from '@/controllers/ModalController';

interface InputTaskModalProps {
  task?: Task;
  status?: StatusType;
}

interface TaskInput {
  title: string;
  description: string;
  assigneeId: string;
  status: StatusType;
}

enum InputType {
  TITLE,
  DESCRIPTION,
  ASSIGNEE,
}

export default function InputTaskModal({
  task,
  status,
}: InputTaskModalProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<TaskInput>({
    title: '',
    description: '',
    assigneeId: '',
    status: status ?? TASK_STATUS.ToDo,
  });

  const createTask = trpc.createTask.useMutation();

  const handleAddTask = async () => {
    setIsLoading(true);
    const { title, description, assigneeId, status } = input;

    try {
      const task = await createTask.mutateAsync({
        description,
        title,
        projectId: 'example-project-id',
        status: status.id as TaskStatus,
        assigneeId: assigneeId || undefined,
      });
      ModalController.close();
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validInput = useMemo(() => {
    return input.title.trim() && input.description.trim();
  }, [input]);

  const isUpdate = !!task;

  const handleInput = (type: InputType, value?: string) => {
    setInput((prev) => {
      switch (type) {
        case InputType.TITLE:
          return { ...prev, title: value ?? '' };

        case InputType.DESCRIPTION:
          return { ...prev, description: value ?? '' };

        default:
          return prev;
      }
    });
  };

  return (
    <div
      className={cn(
        'bg-white grow flex max-w-[70%] flex-col text-start px-3 py-4 rounded-xl space-y-2'
      )}
    >
      <div className="flex justify-between">
        <Text.Headline className="text-black font-medium text-[15px]">
          Create new Task
        </Text.Headline>
        <StatusChip
          className="hover:scale-[104%]"
          status={input.status}
        />
      </div>

      {/* Title Part  */}
      <Text.Body className="font-medium pt-4">Title</Text.Body>
      <input
        onInput={({ currentTarget: { value } }) =>
          handleInput(InputType.TITLE, value)
        }
        type="text"
        className="input text-sm bg-white text-black input-bordered w-full"
        placeholder="Deploy Backend"
      />

      {/* Description Part  */}
      <Text.Body className="font-medium pt-4">Description</Text.Body>
      <textarea
        value={input.description}
        onInput={({ currentTarget: { value } }) =>
          handleInput(InputType.DESCRIPTION, value)
        }
        className="input text-sm bg-white text-black input-bordered w-full pt-2 h-20"
        placeholder="Add as much detail as possible for the AI Suggestions to work properly"
      ></textarea>

      {/* Assignee Part */}
      <Text.Body className="font-medium pt-4">Assign</Text.Body>
      <div className="flex justify-between space-x-2">
        <select
          value={input.assigneeId}
          onChange={(e) => handleInput(InputType.ASSIGNEE, e.target.value)}
          className="select text-xs text-start select-sm text-black select-bordered bg-transparent w-full h-12"
        >
          <option
            disabled
            value=""
          >
            Pick an assignee
          </option>
          {Array.from({ length: 4 }, () => 'hello').map((user, index) => (
            <option
              key={index}
              value={index.toString()}
            >
              {user}
            </option>
          ))}
        </select>
        <button
          disabled={isLoading}
          className="btn btn-primary max-h-12"
        >
          <Text.Subtitle className="text-white">AI Suggestion</Text.Subtitle>
        </button>
      </div>

      <div className="divider" />

      <button
        onClick={handleAddTask}
        disabled={!validInput || isLoading}
        className="btn btn-primary max-h-12"
      >
        {isLoading ? (
          <span className="loading text-white"></span>
        ) : (
          <Text.Body className="text-white">Create</Text.Body>
        )}
      </button>
    </div>
  );
}
