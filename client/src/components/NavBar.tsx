import { useUserContext } from '@/providers/userProvider';
import { cn } from '../lib/utils';
import Text from './Text';
import { GitbookIcon, UserIcon } from 'hugeicons-react';
import ModalController from '@/controllers/ModalController';
import AuthModal from './AuthModal';
import { useProjectContext } from '@/providers/projectProvider';
import { useNavigate } from 'react-router-dom';
import { route, ROUTES } from '@/constants/routes';

export default function Navbar({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { project } = useProjectContext();
  const { user } = useUserContext();

  const navigation = useNavigate();

  const handleLogin = () => {
    if (!user) return ModalController.show(<AuthModal />);
  };

  const handleCreate = () => {
    navigation(route(ROUTES.home));
  };

  return (
    <nav className={cn('flex min-h-14 w-full bg-black/50', className)}>
      <div className="flex items-center justify-between w-full mx-4">
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

        {/* User */}
        <div
          onClick={handleLogin}
          className="border hover:bg-black/50 cursor-pointer h-8 px-4 border-white/20 rounded-md items-center space-x-2 flex"
        >
          <UserIcon size={16} />
          <Text.Body className="text-white">{user?.email || 'Login'}</Text.Body>
        </div>
      </div>
    </nav>
  );
}
