import ToastController from '@/controllers/ToastController';
import { AuthInput, AuthUser } from '@/lib';
import { LocalStorage } from '@/lib/localStorage';
import { trpc } from '@/trpc';
import { User } from '@prisma/client';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
} from 'react';

interface UpdateUserProps {
  updates: Partial<{
    name: string;
    role: string;
    expertise: string;
  }>;
}

interface UserContextType {
  user: User | null;
  isAuth: boolean;
  register: (input: AuthInput) => Promise<void>;
  login: (input: AuthInput) => Promise<void>;
  logout: () => void;
  update: ({ updates }: UpdateUserProps) => Promise<void>;
}

// Create a User context
const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // mutations for user registration and login
  const _registerUser = trpc.registerUser.useMutation();
  const _loginUser = trpc.loginUser.useMutation();
  const _updateUser = trpc.updateUser.useMutation();

  // check if the user is authenticated
  const isAuth = useMemo(() => user !== null, [user]);

  // Handle errors by displaying a toast notification
  const handleError = (error: unknown) => {
    const errorMessage = (error as Error).message;
    console.error(error);
    ToastController.showErrorToast({ description: errorMessage });
  };

  // Register a new user
  const register = useCallback(async (input: AuthInput) => {
    const { email, expertise, role, name } = input;
    try {
      const { user, token: jwt } = await _registerUser.mutateAsync({
        email,
        expertise,
        name,
        role,
      });
      const authUser = { ...user, jwt };
      setUser(authUser);
      LocalStorage.saveUserData(authUser);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Log in an existing user
  const login = useCallback(async (input: AuthInput) => {
    const { email } = input;
    try {
      const { user, token: jwt } = await _loginUser.mutateAsync({ email });
      const authUser = { ...user, jwt };
      setUser(authUser);
      LocalStorage.saveUserData(authUser);
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Log out the user
  const logout = useCallback(() => {
    setUser(null);
    LocalStorage.cleanUserData();
  }, []);

  // Update the user data
  const update = useCallback(
    async ({ updates }: UpdateUserProps) => {
      if (!user) return;
      try {
        const _user = await _updateUser.mutateAsync({ ...updates });
        const authUser = { ..._user, jwt: user.jwt };
        setUser(authUser);
        LocalStorage.saveUserData(authUser);
      } catch (error) {
        handleError(error);
      }
    },
    [user]
  );

  // Load user data from local storage on initial render
  useEffect(() => {
    const user = LocalStorage.fetchUserData();
    if (user) setUser(user);
  }, []);

  const value = { user, isAuth, register, login, logout, update };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Hook to use the User context
export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}
