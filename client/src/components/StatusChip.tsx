import { StatusType } from '@/lib';
import { cn } from '@/lib/utils';
import Text from './Text';
import { useMemo } from 'react';
import {
  AngryIcon,
  ArrowDown01Icon,
  ComputerProgramming01Icon,
  SearchAreaIcon,
  SleepingIcon,
  Tick03Icon,
} from 'hugeicons-react';

interface StatusChipProps {
  status: StatusType;
  className?: string;
}
export default function StatusChip({
  status,
  className,
}: StatusChipProps): JSX.Element {
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

  const { title, color, id } = status;
  return (
    <div
      className={cn(
        'h-8 rounded-md cursor-pointer px-2 flex items-center justify-between',
        color,
        className
      )}
    >
      <div className="flex space-x-2 items-center">
        {icon}
        <Text.Subtitle className="text-white font-medium">
          {title}
        </Text.Subtitle>
      </div>
      {/* <div className="bg-black/10 p-1 rounded-full">
        <ArrowDown01Icon size={16} />
      </div> */}
    </div>
  );
}
