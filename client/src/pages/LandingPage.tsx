import { trpc } from '@/trpc';
import '../App.css';
import ModalController from '@/controllers/ModalController';
import CreateProjectModal from '@/components/CreateProjectModal';
import Text from '@/components/Text';
import { Project } from '@prisma/client';
import { useEffect } from 'react';
import ToastController from '@/controllers/ToastController';
import { useNavigate } from 'react-router-dom';
import { route, ROUTES } from '@/constants/routes';
import { useUserContext } from '@/providers/userProvider';
import AuthModal from '@/components/AuthModal';

interface ProjectTileProps {
  onClick: () => void;
  project: Project;
}

export default function LandingPage() {
  const { isAuth } = useUserContext();
  const navigation = useNavigate();

  const {
    data: projects,
    error,
    isLoading,
  } = trpc.fetchUserProjects.useQuery(undefined, {
    enabled: isAuth,
  });

  useEffect(() => {
    if (!isAuth) return ModalController.show(<AuthModal />, false);
    ModalController.close();
  }, [isAuth]);

  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  const handleCreateProject = () => {
    ModalController.show(<CreateProjectModal />);
  };

  const handleNavigation = (id: string) => {
    navigation(route(ROUTES.project, id));
  };

  return (
    <div className="flex w-full h-full bg-neutral-100">
      {isLoading && <span className="text-black/60 mx-auto loading"></span>}
      {projects && (
        <div
          className={
            'bg-white grow shadow-md md:max-w-screen-md shadow-black/5 flex max-w-[70%] border border-black/5 flex-col text-start px-3 py-4 rounded-xl space-y-2 m-auto'
          }
        >
          <Text.Headline className="text-black font-medium text-[15px]">
            Choose Project
          </Text.Headline>

          {projects.length === 0 && (
            <Text.Body className="text-black/60">
              No projects added yet
            </Text.Body>
          )}

          {projects.map((project) => (
            <ProjectTile
              onClick={() => handleNavigation(project.id)}
              key={project.id}
              project={project}
            />
          ))}

          <div className="divider" />

          <button
            onClick={handleCreateProject}
            className="btn btn-primary max-h-12"
          >
            <Text.Body className="text-white">Create New</Text.Body>
          </button>
        </div>
      )}
    </div>
  );
}

function ProjectTile({ project, onClick }: ProjectTileProps): JSX.Element {
  const { title, description } = project;
  return (
    <div
      onClick={onClick}
      className="w-full hover:bg-neutral-100 p-2 rounded-lg cursor-pointer space-y-1"
    >
      <Text.Body>{title}</Text.Body>
      <Text.Subtitle className="text-black/60">{description}</Text.Subtitle>
    </div>
  );
}
