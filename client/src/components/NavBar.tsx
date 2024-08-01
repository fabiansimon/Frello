import { cn } from '../lib/utils';

export default function Navbar({
  className,
}: {
  className?: string;
}): JSX.Element {
  return <nav className={cn('min-h-14 w-full bg-blue-500', className)}></nav>;
}
