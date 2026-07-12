import dynamic from 'next/dynamic'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Hero } from '@/components/landing/Hero'
import { FloatingBackground } from '@/components/FloatingBackground'

const SocialProof = dynamic(() => import('@/components/landing/SocialProof').then(m => ({ default: m.SocialProof })))
const FeatureGrid = dynamic(() => import('@/components/landing/FeatureGrid').then(m => ({ default: m.FeatureGrid })))
const CTASection = dynamic(() => import('@/components/landing/CTASection').then(m => ({ default: m.CTASection })))

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
