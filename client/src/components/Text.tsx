import { cn } from '../lib/utils';

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

export default function Text({ ...props }): JSX.Element {
  return <></>;
}

Text.Body = Body;
Text.Subtitle = Subtitle;
Text.Headline = Headline;

function Body({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <p
      className={cn('text-sm', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
function Subtitle({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <p
      className={cn('text-xs font-medium', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
function Headline({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <p
      className={cn('text-md', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
