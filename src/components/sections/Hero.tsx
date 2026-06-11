import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { cn } from "@/lib/utils";

type HeroSize = "default" | "tall" | "screen";

const sizeClasses: Record<HeroSize, { section: string; container: string }> = {
  default: {
    section: "min-h-[50vh]",
    container: "min-h-[50vh] py-16",
  },
  tall: {
    section: "min-h-[65vh]",
    container: "min-h-[65vh] py-20",
  },
  screen: {
    section: "min-h-svh",
    container: "min-h-svh py-20",
  },
};

type HeroProps = {
  backgroundImage?: string;
  children: React.ReactNode;
  className?: string;
  overlay?: boolean;
  size?: HeroSize;
};

export function Hero({
  backgroundImage,
  children,
  className,
  overlay = true,
  size = "default",
}: HeroProps) {
  const sizes = sizeClasses[size];

  return (
    <AnimatedSection
      className={cn("relative overflow-hidden", sizes.section, className)}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted">
          {/* TODO: missing hero background image */}
        </div>
      )}
      {overlay ? <div className="absolute inset-0 bg-primary/55" /> : null}
      <Container
        className={cn(
          "relative z-10 flex flex-col justify-center text-primary-foreground",
          sizes.container,
        )}
      >
        {children}
      </Container>
    </AnimatedSection>
  );
}
