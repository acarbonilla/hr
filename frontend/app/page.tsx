import {
  HeroSection,
  HighlightsSection,
  HomePageFooter,
  HowItWorksSection,
  TrustSection,
} from "@/components/home";

export default function HomePage() {
  return (
    <main className="home-page-font min-h-screen bg-slate-950 text-slate-100">
      <HeroSection />
      <HowItWorksSection />
      <TrustSection />
      <HighlightsSection />
      <HomePageFooter />
    </main>
  );
}
