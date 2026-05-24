import {
  CtaSection,
  FlowSection,
  HeroSection,
  LandingFooter,
  LandingNav,
  ToolsSection,
} from "@/components/landing";

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
