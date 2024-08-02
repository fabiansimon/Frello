import { cn } from '@/lib/utils';
import Text from './Text';
import { useMemo, useState } from 'react';
import { AuthInput } from '@/lib';
import { useUserContext } from '@/providers/userProvider';
import ModalController from '@/controllers/ModalController';

enum InputType {
  NAME,
  EMAIL,
  ROLE,
  EXPERTISE,
}

export default function AuthModal(): JSX.Element {
  const { login } = useUserContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<AuthInput>({
    email: '',
    expertise: '',
    name: '',
    role: '',
  });

  const validInput = useMemo(() => {
    return (
      input.email.trim() &&
      input.expertise.trim() &&
      input.name.trim() &&
      input.role.trim()
    );
  }, [input]);

  const handleCreateUser = async () => {
    setIsLoading(true);
    await login(input);
    setIsLoading(false);
    ModalController.close();
  };

  const handleInput = (type: InputType, value?: string) => {
    setInput((prev) => {
      switch (type) {
        case InputType.NAME:
          return { ...prev, name: value ?? '' };

        case InputType.EMAIL:
          return { ...prev, email: value ?? '' };

        case InputType.ROLE:
          return { ...prev, role: value ?? '' };

        case InputType.EXPERTISE:
          return { ...prev, expertise: value ?? '' };

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
          Create new Account
        </Text.Headline>
      </div>

      {/* Title Part & Role Part */}
      <div className="flex space-x-2">
        <div className="grow">
          <Text.Body className="font-medium pt-4">Name</Text.Body>
          <input
            onInput={({ currentTarget: { value } }) =>
              handleInput(InputType.NAME, value)
            }
            type="text"
            value={input.name}
            className="input text-sm bg-white text-black input-bordered w-full"
            placeholder="Fabian Simon"
          />
        </div>
        <div className="grow">
          <Text.Body className="font-medium pt-4">Role</Text.Body>
          <input
            onInput={({ currentTarget: { value } }) =>
              handleInput(InputType.ROLE, value)
            }
            type="text"
            value={input.role}
            className="input text-sm bg-white text-black input-bordered w-full"
            placeholder="Full-Stack Developer"
          />
        </div>
      </div>

      {/* Title Part  */}
      <Text.Body className="font-medium pt-4">Email</Text.Body>
      <input
        onInput={({ currentTarget: { value } }) =>
          handleInput(InputType.EMAIL, value)
        }
        type="email"
        value={input.email}
        className="input text-sm bg-white text-black input-bordered w-full"
        placeholder="fabian.simon98@gmail.com"
      />

      {/* Expertise Part */}
      <Text.Body className="font-medium pt-4">Expertise</Text.Body>
      <textarea
        value={input.expertise}
        onInput={({ currentTarget: { value } }) =>
          handleInput(InputType.EXPERTISE, value)
        }
        className="input text-sm bg-white text-black input-bordered w-full pt-2 h-20"
        placeholder="Add as much detail as possible for the AI Suggestions to work properly"
      ></textarea>

      <div className="divider" />

      <button
        onClick={handleCreateUser}
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
