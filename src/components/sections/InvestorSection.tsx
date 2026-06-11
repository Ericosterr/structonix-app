import { investments } from "@data/investments";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InvestmentCard } from "@/components/ui/InvestmentCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

type InvestorSectionProps = {
  title?: string;
  className?: string;
};

export function InvestorSection({ title, className }: InvestorSectionProps) {
  return (
    <AnimatedSection className={cn("py-16", className)}>
      <Container className="space-y-8">
        {title ? <SectionHeading title={title} /> : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {investments.map((project) => (
            <InvestmentCard key={project.id} project={project} />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
