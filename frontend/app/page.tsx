'use client';

import { HeroSection } from '@/components/sections/hero-section';
import { PerformanceSection } from '@/components/sections/performance-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { FeaturesSection } from '@/components/sections/features-section';
import { CTASection } from '@/components/sections/cta-section';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <PerformanceSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}