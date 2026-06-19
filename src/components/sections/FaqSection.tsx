import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export type FaqItem = {
  q: string;
  a: string;
};

type FaqSectionProps = {
  title: string;
  items: FaqItem[];
  className?: string;
};

export function FaqSection({ title, items, className }: FaqSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-14 md:py-20", className)}>
      <Container className="max-w-3xl">
        <SectionHeading title={title} className="mb-8 text-center" />
        <div className="divide-y divide-border rounded-[var(--radius-card)] border border-border">
          {items.map((item, index) => (
            <details key={`${item.q.slice(0, 24)}-${index}`} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                <span>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-primary transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
