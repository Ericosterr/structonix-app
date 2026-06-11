import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { company } from "@config/company";
import { site } from "@config/site";
import { Link } from "@/i18n/navigation";
import { FooterSocialIcons } from "@/components/layout/FooterSocialIcons";
import { Container } from "@/components/ui/Container";

export async function Footer() {
  const tFooter = await getTranslations("footer");

  return (
    <footer className="mt-auto bg-primary text-white">
      <Container className="py-5 md:py-6">
        <div className="flex flex-col items-center gap-5 md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-6">
          {/* Left — logo */}
          <div className="flex w-full items-center justify-center md:justify-start">
            <Image
              src={site.assets.logoWhite}
              alt={company.companyName}
              width={220}
              height={60}
              className="h-12 w-auto md:h-14"
            />
          </div>

          {/* Center — legal text (bottom-aligned on desktop) */}
          <div className="flex w-full flex-col items-center justify-center text-center md:w-auto md:max-w-xl md:justify-end md:justify-self-center">
            <p className="text-xs leading-snug text-white">
              {tFooter("legalLine")}
            </p>
            <Link
              href="/politica-de-privacidad"
              className="mt-0.5 inline-block text-xs leading-snug text-white underline-offset-4 transition-opacity hover:opacity-80 hover:underline"
            >
              {tFooter("privacy")}
            </Link>
          </div>

          {/* Right — social icons */}
          <div className="flex w-full items-center justify-center md:justify-end">
            <FooterSocialIcons />
          </div>
        </div>
      </Container>
    </footer>
  );
}
