import { cn } from '@/lib/utils';
import Text from './Text';
import { useMemo, useState } from 'react';
import { User } from '@prisma/client';
import { AuthInput } from '@/lib';
import { useUserContext } from '@/providers/userProvider';
import { REGEX } from '@/constants/regex';
import ToastController from '@/controllers/ToastController';
import AlertController from '@/controllers/AlertController';
import { useNavigate } from 'react-router-dom';
import { route, ROUTES } from '@/constants/routes';
import ModalController from '@/controllers/ModalController';

enum InputType {
  NAME,
  EMAIL,
  ROLE,
  EXPERTISE,
}

export default function AuthModal({ user }: { user?: User }): JSX.Element {
  const { register, login, update, logout } = useUserContext();

  const navigation = useNavigate();

  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<AuthInput>({
    email: user?.email || '',
    expertise: user?.expertise || '',
    name: user?.name || '',
    role: user?.role || '',
  });

  const isUpdate = user !== undefined;

  const validInput = useMemo(() => {
    if (isUpdate)
      return (
        input.name.trim() !== user.name ||
        input.role.trim() !== user.role ||
        input.expertise.trim() !== user.expertise
      );

    if (isLogin) return input.email.trim();
    return (
      input.email.trim() &&
      input.expertise.trim() &&
      input.name.trim() &&
      input.role.trim()
    );
  }, [input, isLogin, isUpdate]);

  const { button, title, underlineText } = useMemo(() => {
    if (isUpdate)
      return {
        title: 'Update Account',
        button: 'Update',
        underlineText: 'Log out',
      };
    return {
      title: isLogin ? 'Login in Account' : 'Create new Account',
      button: isLogin ? 'Login' : 'Create',
      underlineText: isLogin ? 'Register instead' : 'Login instead',
    };
  }, [isUpdate, isLogin]);

  const handleLogout = async () => {
    AlertController.show({
      title: 'Log out?',
      description: 'Are you sure you want to log out?',
      buttonText: 'Continue',
      callback: () => {
        ModalController.close();
        logout();
        navigation(route(ROUTES.home));
      },
    });
  };
  const handleUpdate = async () => {
    setIsLoading(true);
    await update({ updates: input });
    setIsLoading(false);
    ModalController.close();
  };

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
        {title}
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
          !isUpdate && handleInput(InputType.EMAIL, value)
        }
        type="email"
        value={input.email}
        className={cn(
          'input text-sm bg-white text-black input-bordered w-full',
          isUpdate && 'bg-neutral-200 opacity-50 cursor-not-allowed'
        )}
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
        onClick={isUpdate ? handleUpdate : handleAuth}
        disabled={!validInput || isLoading}
        className="btn btn-primary max-h-12"
      >
        {isLoading ? (
          <span className="loading text-white"></span>
        ) : (
          <Text.Body className="text-white">{button}</Text.Body>
        )}
      </button>

      <Text.Body
        onClick={() =>
          isUpdate ? handleLogout() : setIsLogin((prev) => !prev)
        }
        className="text-black/60 cursor-pointer underline mx-auto py-2"
      >
        {underlineText}
      </Text.Body>
    </div>
  );
}
