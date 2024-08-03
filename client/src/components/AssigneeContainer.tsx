import { cn } from '@/lib/utils';
import { useProjectContext } from '@/providers/projectProvider';
import { useMemo } from 'react';
import Text from './Text';
import { UserIcon } from 'hugeicons-react';
import { useUserContext } from '@/providers/userProvider';

interface AssigneeContainerProps {
  assigneeId: string;
  className?: string;
}
export default function AssigneeContainer({
  assigneeId,
  className,
}: AssigneeContainerProps): JSX.Element {
  const { user: self } = useUserContext();
  const { users } = useProjectContext();
  const user = useMemo(() => users.get(assigneeId), [assigneeId]);

  const string = useMemo(() => {
    if (!user) return 'Not assigned';
    const name = user.id === self?.id ? 'You' : user.name;

    return `Assigned to ${name}`;
  }, [user, self]);
  return (
    <div
      className={cn(
        'border border-black/10 bg-white rounded-lg p-2 flex justify-between',
        className
      )}
    >
      <Text.Subtitle>{string}</Text.Subtitle>
      <UserIcon
        fill="black"
        size={16}
        className="text-neutral-500 ml-4"
      />
    </div>
  );
}
