import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: string;
  className?: string;
  id?: string;
};

export function SectionHeading({ title, className, id }: SectionHeadingProps) {
  return (
    <h2
      id={id}
      className={cn("text-2xl font-semibold tracking-tight md:text-3xl", className)}
    >
      {title}
    </h2>
  );
}
