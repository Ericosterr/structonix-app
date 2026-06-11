import { getTranslations } from "next-intl/server";
import { teamMembers } from "@data/team";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TeamCard } from "@/components/ui/TeamCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

type TeamCardsSectionProps = {
  className?: string;
};

export async function TeamCardsSection({ className }: TeamCardsSectionProps) {
  const t = await getTranslations("about");

  return (
    <AnimatedSection className={cn("py-12 md:py-16", className)}>
      <Container className="space-y-8">
        <SectionHeading title={t("equipo")} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <TeamCard key={member.image} member={member} />
          ))}
        </div>
      </Container>
    </AnimatedSection>
  );
}
