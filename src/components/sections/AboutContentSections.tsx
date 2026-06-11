import { getTranslations } from "next-intl/server";
import { aboutContentSectionKeys } from "@data/about-sections";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

type AboutContentSectionsProps = {
  keys?: readonly (typeof aboutContentSectionKeys)[number][];
};

export async function AboutContentSections({ keys }: AboutContentSectionsProps) {
  const t = await getTranslations("about");
  const sectionKeys = keys ?? aboutContentSectionKeys;

  return (
    <>
      {sectionKeys.map((key) => {
        const text = t(`${key}Text`);

        return (
          <AnimatedSection key={key} className="py-12 md:py-16">
            <Container className="space-y-4">
              <SectionHeading title={t(key)} />
              {text ? (
                <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-muted-foreground">
                  {text.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </Container>
          </AnimatedSection>
        );
      })}
    </>
  );
}
