import { cn } from '../lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Text(): JSX.Element {
  return <></>;
}

Text.Body = Body;
Text.Subtitle = Subtitle;
Text.Headline = Headline;

function Body({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <p
      className={cn('text-sm text-black', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
function Subtitle({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <p
      className={cn('text-xs font-medium text-black', className)}
      {...rest}
    >
      {children}
    </p>
  );
}
function Headline({ children, className, ...rest }: TextProps): JSX.Element {
  return (
    <h1
      className={cn('text-lg text-black', className)}
      {...rest}
    >
      {children}
    </h1>
  );
}
