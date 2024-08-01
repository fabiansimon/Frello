import { cn } from '@/lib/utils';
import Text from './Text';
import { Task } from '@prisma/client';
import { useMemo, useState } from 'react';
import { trpc } from '@/trpc';

interface InputTaskModalProps {
  task?: Task;
}

interface TaskInput {
  title: string;
  description: string;
  assigneeId: string;
}

enum InputType {
  TITLE,
  DESCRIPTION,
  ASSIGNEE,
}

export default function InputTaskModal({
  task,
}: InputTaskModalProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<TaskInput>({
    title: '',
    description: '',
    assigneeId: '',
  });

  const createTask = trpc.createTask.useMutation();

  const handleAddTask = async () => {
    setIsLoading(true);
    const { title, description, assigneeId } = input;

    try {
      const task = await createTask.mutateAsync({
        description,
        title,
        projectId: 'example-project-id',
        status: 'ToDo',
        assigneeId: assigneeId || undefined,
      });
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
      <Text.Headline className="text-black font-medium text-[15px]">
        Create new Task
      </Text.Headline>

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

      {/* Assigne Part */}
      <Text.Body className="font-medium pt-4">Assign</Text.Body>
      <div className="flex justify-between space-x-2">
        <select
          onChange={(e) => handleInput(InputType.ASSIGNEE, e.target.value)}
          className="select text-xs text-start select-sm text-black select-bordered bg-transparent w-full h-12"
        >
          <option
            disabled
            selected
          >
            Pick as assignee
          </option>
          {Array.from({ length: 4 }, () => 'hello').map((user, index) => (
            <option
              key={index}
              value={index}
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
