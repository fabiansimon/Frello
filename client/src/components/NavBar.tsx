import { cn } from '../lib/utils';

export default function Navbar({
  className,
}: {
  className?: string;
}): JSX.Element {
  return <nav className={cn('min-h-14 w-full bg-black/50', className)}></nav>;
}
