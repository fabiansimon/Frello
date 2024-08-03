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

interface UserContextType {
  user: User | null;
  isAuth: boolean;
  register: (input: AuthInput) => Promise<void>;
  login: (input: AuthInput) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Mutations
  const _registerUser = trpc.registerUser.useMutation();
  const _loginUser = trpc.loginUser.useMutation();

  const isAuth = useMemo(() => user !== null, [user]);

  const handleError = (error: unknown) => {
    const errorMessage = (error as Error).message;
    console.error(error);
    ToastController.showErrorToast({ description: errorMessage });
  };

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

  const logout = useCallback(() => {
    setUser(null);
    LocalStorage.cleanUserData();
  }, []);

  useEffect(() => {
    const user = LocalStorage.fetchUserData();
    if (user) setUser(user);
  }, []);

  const value = { user, isAuth, register, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}
