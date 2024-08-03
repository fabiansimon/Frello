import { cn } from '@/lib/utils';
import { useProjectContext } from '@/providers/projectProvider';
import { useMemo } from 'react';
import Text from './Text';
import { UserIcon } from 'hugeicons-react';

interface AssigneeContainerProps {
  assigneeId: string;
  className?: string;
}
export default function AssigneeContainer({
  assigneeId,
  className,
}: AssigneeContainerProps): JSX.Element {
  const { users } = useProjectContext();
  const user = useMemo(() => users.get(assigneeId), [assigneeId]);

  return (
    <div
      className={cn(
        'border border-black/10 bg-white rounded-lg p-2 flex justify-between',
        className
      )}
    >
      <Text.Subtitle>
        {user?.name ? `Assigned to ${user?.name}` : 'Not assigned'}
      </Text.Subtitle>
      <UserIcon
        fill="black"
        size={16}
        className="text-neutral-500 ml-4"
      />
    </div>
  );
}
