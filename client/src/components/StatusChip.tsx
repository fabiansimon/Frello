import { StatusType } from '@/lib';
import { cn } from '@/lib/utils';
import Text from './Text';
import { useMemo, useState } from 'react';
import {
  AngryIcon,
  ComputerProgramming01Icon,
  SearchAreaIcon,
  SleepingIcon,
  Tick03Icon,
} from 'hugeicons-react';
import { TASK_STATUS } from '@/constants/TaskStatus';
import { motion } from 'framer-motion';

interface StatusChipProps {
  status: StatusType;
  className?: string;
  isLoading?: boolean;
  onSelect?: (type: StatusType) => void;
}
export default function StatusChip({
  isLoading = false,
  status,
  className,
  onSelect,
}: StatusChipProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const restStatuses = useMemo(
    () => Object.values(TASK_STATUS).filter((s) => s.id !== status.id),
    [status]
  );

  const handleExpand = () => {
    if (isLoading || !onSelect) return;
    setIsExpanded((prev) => !prev);
  };

  const handleSelection = (type: StatusType) => {
    if (onSelect) onSelect(type);
    handleExpand();
  };

  return (
    <div className={cn('min-w-28', className)}>
      <Chip
        isLoading={isLoading}
        onClick={handleExpand}
        status={status}
      />
      {!isLoading && isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="overflow-hidden absolute space-y-1 pt-1"
        >
          {restStatuses.map((s) => (
            <Chip
              className="opacity-50 hover:opacity-100"
              onClick={() => handleSelection(s)}
              key={s.id}
              status={s}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function Chip({
  status,
  isLoading,
  className,
  onClick,
}: StatusChipProps & { onClick: () => void }): JSX.Element {
  const { title, color } = status;

  const icon = useMemo(() => {
    switch (status.id) {
      case 'ToDo':
        return <SleepingIcon size={16} />;
      case 'InProgress':
        return <ComputerProgramming01Icon size={16} />;
      case 'InReview':
        return <SearchAreaIcon size={16} />;
      case 'Done':
        return <Tick03Icon size={16} />;
      case 'Declined':
        return <AngryIcon size={16} />;

      default:
        break;
    }
  }, [status]);

  return (
    <div
      onClick={onClick}
      className={cn(
        'h-8 rounded-md cursor-pointer px-2 flex items-center justify-between',
        color,
        className
      )}
    >
      {isLoading && <span className="loading mx-auto text-white size-4" />}
      {!isLoading && (
        <div className="flex space-x-2 items-center justify-between w-full">
          {icon}
          <Text.Subtitle className="text-white font-medium">
            {title}
          </Text.Subtitle>
        </div>
      )}
    </div>
  );
}
