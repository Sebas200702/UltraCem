import { CtaSection } from "./_components/landing/cta-section";
import { FlowSection } from "./_components/landing/flow-section";
import { HeroSection } from "./_components/landing/hero-section";
import { LandingFooter } from "./_components/landing/landing-footer";
import { LandingNav } from "./_components/landing/landing-nav";
import { ToolsSection } from "./_components/landing/tools-section";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className="bg-ultracem-surface">
        <HeroSection />
        <FlowSection />
        <ToolsSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
