import { useProjectContext } from '@/providers/projectProvider';
import Text from './Text';
import { useMemo, useState } from 'react';
import { ProjectInput } from '@/lib';
import ModalController from '@/controllers/ModalController';

enum InputType {
  TITLE,
  DESCRIPTION,
}

export default function CreateProjectModal(): JSX.Element {
  const { createProject } = useProjectContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<ProjectInput>({
    description: '',
    title: '',
  });

  const validInput = useMemo(
    () => input.description.trim() && input.title.trim(),
    [input]
  );

  const handleCreate = async () => {
    setIsLoading(true);
    await createProject(input);
    setIsLoading(false);
    ModalController.close();
  };

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
      className={
        'bg-white grow shadow-md shadow-black/5 flex max-w-[70%] border border-black/5 flex-col text-start px-3 py-4 rounded-xl space-y-2 m-auto'
      }
    >
      <div className="flex justify-between">
        <Text.Headline className="text-black font-medium text-[15px]">
          Create new Project
        </Text.Headline>
      </div>

      {/* Title */}
      <div>
        <Text.Body className="font-medium pt-4">Name</Text.Body>
        <input
          onInput={({ currentTarget: { value } }) =>
            handleInput(InputType.TITLE, value)
          }
          type="text"
          value={input.title}
          className="input text-sm bg-white text-black input-bordered w-full mt-2"
          placeholder="Alphabet Inc."
        />
      </div>

      {/* Description Part */}
      <Text.Body className="font-medium pt-4">Expertise</Text.Body>
      <textarea
        value={input.description}
        onInput={({ currentTarget: { value } }) =>
          handleInput(InputType.DESCRIPTION, value)
        }
        className="input text-sm bg-white text-black input-bordered w-full pt-2 h-20"
        placeholder="Alphabet (Google's parent company) is a multinational conglomerate that focuses on diverse areas of technology, including search engines, advertising, consumer electronics, cloud computing, artificial intelligence, and more, driving innovation and development in these fields."
      ></textarea>

      <div className="divider" />

      <button
        onClick={handleCreate}
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
