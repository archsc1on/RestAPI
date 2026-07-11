'use client'

import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Hero } from '@/components/landing/Hero'
import { SocialProof } from '@/components/landing/SocialProof'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { CTASection } from '@/components/landing/CTASection'
import { FloatingBackground } from '@/components/FloatingBackground'

export default function Home() {
  return (
    <PageWrapper noPadding>
      <FloatingBackground />
      <NavBar />
      <Hero />
      <SocialProof />
      <FeatureGrid />
      <CTASection />
      <Footer />
    </PageWrapper>
  )
}
