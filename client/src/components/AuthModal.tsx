import { cn } from '@/lib/utils';
import Text from './Text';
import { useMemo, useState } from 'react';
import { AuthInput } from '@/lib';
import { useUserContext } from '@/providers/userProvider';
import ModalController from '@/controllers/ModalController';
import { REGEX } from '@/constants/regex';
import ToastController from '@/controllers/ToastController';

enum InputType {
  NAME,
  EMAIL,
  ROLE,
  EXPERTISE,
}

export default function AuthModal(): JSX.Element {
  const { register, login } = useUserContext();

  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<AuthInput>({
    email: '',
    expertise: '',
    name: '',
    role: '',
  });

  const validInput = useMemo(() => {
    if (isLogin) return input.email.trim();
    return (
      input.email.trim() &&
      input.expertise.trim() &&
      input.name.trim() &&
      input.role.trim()
    );
  }, [input]);

  const handleAuth = async () => {
    if (!REGEX.email.test(input.email))
      return ToastController.showErrorToast({
        title: 'Invalid email',
        description: 'Please make sure to add a valid email',
      });

    setIsLoading(true);
    if (isLogin) {
      await login(input);
    } else {
      await register(input);
    }
    setIsLoading(false);
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
        'bg-white grow md:max-w-screen-md flex flex-col text-start px-3 py-4 rounded-xl space-y-2'
      )}
    >
      <Text.Headline className="text-black font-medium text-[15px]">
        {isLogin ? 'Login in Account' : 'Create new Account'}
      </Text.Headline>

      {/* Name Part & Role Part */}
      {!isLogin && (
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
      )}

      {/* Email Part  */}
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
      {!isLogin && (
        <>
          <Text.Body className="font-medium pt-4">Expertise</Text.Body>
          <textarea
            value={input.expertise}
            onInput={({ currentTarget: { value } }) =>
              handleInput(InputType.EXPERTISE, value)
            }
            className="input text-sm bg-white text-black input-bordered w-full pt-2 h-20"
            placeholder="Add as much detail as possible for the AI Suggestions to work properly"
          ></textarea>
        </>
      )}

      <div className="divider" />

      <button
        onClick={handleAuth}
        disabled={!validInput || isLoading}
        className="btn btn-primary max-h-12"
      >
        {isLoading ? (
          <span className="loading text-white"></span>
        ) : (
          <Text.Body className="text-white">
            {isLogin ? 'Login' : 'Create'}
          </Text.Body>
        )}
      </button>

      <Text.Body
        onClick={() => setIsLogin((prev) => !prev)}
        className="text-black/60 cursor-pointer underline mx-auto py-2"
      >
        {isLogin ? 'Register instead' : 'Login instead'}
      </Text.Body>
    </div>
  );
}
