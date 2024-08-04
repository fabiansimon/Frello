import { useUserContext } from '@/providers/userProvider';
import { cn, pluralize } from '../lib/utils';
import Text from './Text';
import { GitbookIcon, UserIcon, UserMultiple02Icon } from 'hugeicons-react';
import ModalController from '@/controllers/ModalController';
import AuthModal from './AuthModal';
import { useProjectContext } from '@/providers/projectProvider';
import { useNavigate } from 'react-router-dom';
import { route, ROUTES } from '@/constants/routes';
import UserListModal from './UserListModal';
import AlertController from '@/controllers/AlertController';

export default function Navbar({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { project, users } = useProjectContext();
  const { user, logout } = useUserContext();

  const navigation = useNavigate();

  const handleAccount = () => {
    AlertController.show({
      title: 'Log out?',
      description: 'Are you sure you want to log out?',
      buttonText: 'Continue',
      callback: () => {
        logout();
        navigation(route(ROUTES.home));
      },
    });
  };

  const handleCreate = () => {
    navigation(route(ROUTES.home));
  };

  const handleShowUsers = () => {
    ModalController.show(<UserListModal />);
  };

  return (
    <nav className={cn('flex min-h-14 w-full bg-black/50', className)}>
      <div className="flex items-center justify-between w-full mx-4">
        <div className="flex space-x-2">
          {/* Project Selection */}
          <div
            onClick={handleCreate}
            className="border hover:bg-black/50 cursor-pointer h-8 px-4 border-white/20 rounded-md items-center space-x-2 flex"
          >
            <GitbookIcon size={16} />
            <Text.Body className="text-white">
              {project?.title || 'Create Project'}
            </Text.Body>
          </div>

          {/* Users Selection */}
          <div
            onClick={handleShowUsers}
            className="border hover:bg-black/50 cursor-pointer h-8 px-4 border-white/20 rounded-md items-center space-x-2 flex"
          >
            <UserMultiple02Icon size={16} />
            <Text.Body className="text-white">
              {pluralize(users.size, 'user')}
            </Text.Body>
          </div>
        </div>

        {/* User */}
        <div
          onClick={handleAccount}
          className="border hover:bg-black/50 cursor-pointer h-8 px-4 border-white/20 rounded-md items-center space-x-2 flex"
        >
          <UserIcon size={16} />
          <Text.Body className="text-white">{user?.email || 'Login'}</Text.Body>
        </div>
      </div>
    </nav>
  );
}
