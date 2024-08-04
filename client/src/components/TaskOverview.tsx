import { PopulatedStatusType } from '@/lib';
import Text from './Text';
import { cn, pluralize } from '@/lib/utils';
import { useProjectContext } from '@/providers/projectProvider';
import TaskContainer from './TaskContainer';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
} from 'hugeicons-react';

interface TaskOverviewProps {
  data: PopulatedStatusType[];
}

interface OverviewTileProps {
  data: PopulatedStatusType;
}
export default function TaskOverview({ data }: TaskOverviewProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { personalTasks } = useProjectContext();

  return (
    <motion.div
      animate={isExpanded ? 'expanded' : 'minimized'}
      variants={{ minimized: { width: 80 }, expanded: { width: 350 } }}
      className={cn(
        'max-w-80 fixed w-full right-2 top-20 bottom-2 rounded-xl grow max-h-full items-start flex flex-col bg-neutral-100 mx-4 mb-6',
        isExpanded ? 'p-4' : 'p-1'
      )}
    >
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="bg-white cursor-pointer absolute right-5 -top-2 rounded-full p-2 shadow-sm shadow-black/10 border border-black/10"
      >
        {isExpanded ? (
          <ArrowRight02Icon className="text-black" />
        ) : (
          <ArrowLeft02Icon className="text-black" />
        )}
      </div>
      {!isExpanded && (
        <>
          <div className="space-y-3 mt-11 w-full">
            {data.map(({ color, tasks, id, title }) => (
              <div
                key={id}
                className={cn(
                  'w-full h-12 rounded-lg justify-center flex-col flex',
                  color
                )}
              >
                <Text.Body className="font-medium text-white">
                  {tasks.length}
                </Text.Body>
                <Text.Subtitle className="text-white text-[10px]">
                  {title}
                </Text.Subtitle>
              </div>
            ))}
            <div
              className={cn(
                'w-full h-12 rounded-lg justify-center flex-col flex bg-neutral-300/50 border border-black/10'
              )}
            >
              <Text.Body className="font-medium">
                {personalTasks.length}
              </Text.Body>
              <Text.Subtitle className="text-[10px]">{'You'}</Text.Subtitle>
            </div>
          </div>
        </>
      )}
      {isExpanded && (
        <>
          <Text.Headline className="font-medium">Overview</Text.Headline>
          <Text.Body className="text-black/60">
            Current overview of the various tasks.
          </Text.Body>
          <div className="space-y-3 mt-4 w-full">
            {data.map((type) => (
              <OverviewTile
                key={type.id}
                data={type}
              />
            ))}
          </div>

          <div className="divider" />
          <Text.Headline className="font-medium -mt-2">
            Personal tasks
          </Text.Headline>
          <Text.Body className="text-black/60">Tasks assigned to you</Text.Body>
          <div className="space-y-3 mt-4 w-full h-full overflow-y-auto">
            {personalTasks.length === 0 && (
              <Text.Subtitle className="text-black/50">
                No tasks assigned to you
              </Text.Subtitle>
            )}
            {personalTasks.map((task) => (
              <TaskContainer
                showStatus
                className="border m-1 border-black/10"
                task={task}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function OverviewTile({ data }: OverviewTileProps): JSX.Element {
  const { color, tasks, title } = data;

  return (
    <div className="w-full flex">
      <div className={cn('p-2 flex justify-between w-full rounded-lg', color)}>
        <Text.Subtitle className={cn('text-white')}>{title}</Text.Subtitle>
        <Text.Subtitle className={cn('font-medium text-white')}>
          {pluralize(tasks.length, 'task')}
        </Text.Subtitle>
      </div>
    </div>
  );
}
