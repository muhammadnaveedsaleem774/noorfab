import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional max-width override; default 1400px */
  maxWidth?: "narrow" | "default" | "full";
  /** Optional padding override */
  noPadding?: boolean;
}

const maxWidthClass = {
  narrow: "max-w-4xl",
  default: "max-w-[1400px]",
  full: "max-w-full",
} as const;

/**
 * Premium responsive container for AL-NOOR.
 * - Max-width: 1400px (desktop)
 * - Padding: 1rem mobile, 2rem tablet (md), 3rem desktop (lg+)
 * - Center aligned
 */
export function Container({
  className,
  maxWidth = "default",
  noPadding,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClass[maxWidth],
        !noPadding && "px-4 md:px-8 lg:px-12",
        className
      )}
      {...props}
    />
  );
}
