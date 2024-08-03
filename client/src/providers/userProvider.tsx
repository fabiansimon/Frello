import ToastController from '@/controllers/ToastController';
import { AuthInput } from '@/lib';
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
  login: (input: AuthInput) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Mutations
  const _createUser = trpc.createUser.useMutation();

  const isAuth = useMemo(() => user !== null, [user]);

  const login = useCallback(async (input: AuthInput) => {
    const { email, expertise, role, name } = input;
    try {
      const user = await _createUser.mutateAsync({
        email,
        expertise,
        name,
        role,
      });
      setUser(user);
      LocalStorage.saveUserData(user);
    } catch (error) {
      console.error(error);
      ToastController.showErrorToast({ description: error.message });
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    const user = LocalStorage.fetchUserData();
    if (user) setUser(user);
  }, []);

  const value = { user, isAuth, login, logout };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }

  return context;
}
