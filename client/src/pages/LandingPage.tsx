import { trpc } from '@/trpc';
import '../App.css';
import ModalController from '@/controllers/ModalController';
import CreateProjectModal from '@/components/CreateProjectModal';
import Text from '@/components/Text';
import { Project } from '@prisma/client';
import { useEffect, useState } from 'react';
import ToastController from '@/controllers/ToastController';
import { useNavigate } from 'react-router-dom';
import { route, ROUTES } from '@/constants/routes';
import { useUserContext } from '@/providers/userProvider';
import AuthModal from '@/components/AuthModal';
import { Delete01Icon } from 'hugeicons-react';
import AlertController from '@/controllers/AlertController';

interface ProjectTileProps {
  project: Project;
  isAdmin: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function LandingPage() {
  const { isAuth, logout, user } = useUserContext();
  const navigation = useNavigate();

  // Mutation
  const _deleteProject = trpc.deleteProject.useMutation();

  // Query
  const {
    data: projects,
    error,
    isLoading,
    refetch,
  } = trpc.fetchUserProjects.useQuery(undefined, {
    enabled: isAuth,
  });

  // Show authentication modal if user is not authenticated
  useEffect(() => {
    if (!isAuth) return ModalController.show(<AuthModal />, false);
    ModalController.close();
  }, [isAuth]);

  // Show error toast if there is an error fetching projects
  useEffect(() => {
    if (error) ToastController.showErrorToast({ description: error.message });
  }, [error]);

  const handleDeleteProject = async (projectId: string) => {
    AlertController.show({
      title: 'Are you sure?',
      description: 'This action cannot be reverted.',
      callback: async () => await deleteProject(projectId),
    });
  };

  const handleCreateProject = () => {
    ModalController.show(<CreateProjectModal />);
  };

  const handleNavigation = (id: string) => {
    navigation(route(ROUTES.project, id));
  };

  // Delete project and refetch projects list
  const deleteProject = async (projectId: string) => {
    try {
      await _deleteProject.mutateAsync({
        projectId,
      });
      refetch();
    } catch (error) {
      const errorMessage = (error as Error).message;
      ToastController.showErrorToast({ description: errorMessage });
    }
  };

  return (
    <div className="flex w-full h-full bg-neutral-100">
      {/* Loading Spinner */}
      {isLoading && <span className="text-black/60 mx-auto loading"></span>}

      {/* Projects List */}
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

          <div className="bg-neutral-100 p-2 rounded-md">
            <Text.Subtitle className="text-black/60">
              If you want to be added to an exisiting project, you must be
              invited by the admin.
            </Text.Subtitle>
          </div>

          {projects.map((project) => {
            const isAdmin = user?.id === project.adminId;
            return (
              <ProjectTile
                onClick={() => handleNavigation(project.id)}
                onDelete={() => handleDeleteProject(project.id)}
                isAdmin={isAdmin}
                key={project.id}
                project={project}
              />
            );
          })}

          <div className="divider" />

          <button
            onClick={handleCreateProject}
            className="btn btn-primary max-h-12"
          >
            <Text.Body className="text-white">Create New</Text.Body>
          </button>
          <Text.Subtitle
            onClick={logout}
            className="text-black/60 cursor-pointer text-center pt-1 underline"
          >
            Log out
          </Text.Subtitle>
        </div>
      )}
    </div>
  );
}

function ProjectTile({
  project,
  isAdmin,
  onClick,
  onDelete,
}: ProjectTileProps): JSX.Element {
  const [hovererd, setHovered] = useState<boolean>(false);
  const { title, description } = project;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className="w-full hover:bg-neutral-100 p-2 rounded-lg cursor-pointer flex justify-between"
    >
      <div className="space-y-1">
        <Text.Body>{title}</Text.Body>
        <Text.Subtitle className="text-black/60">{description}</Text.Subtitle>
      </div>
      {isAdmin && hovererd && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="bg-white hover:scale-[102%] rounded-md items-center justify-center flex space-x-2 px-2"
        >
          <Delete01Icon
            size={16}
            className="text-black/60"
          />
          <Text.Subtitle className="text-black/60">Delete</Text.Subtitle>
        </div>
      )}
    </div>
  );
}
