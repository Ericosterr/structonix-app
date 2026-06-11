import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  className?: string;
};

export function SectionHeading({ title, className }: SectionHeadingProps) {
  return (
    <h2 className={cn("text-2xl font-semibold tracking-tight md:text-3xl", className)}>
      {title}
    </h2>
  );
}
