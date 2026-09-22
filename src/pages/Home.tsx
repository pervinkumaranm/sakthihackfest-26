import Hero from '../components/Hero'
import EventIntro from '../components/EventIntro'
import ChallengeCards from '../components/ChallengeCards'
import WhyParticipate from '../components/WhyParticipate'
import Timeline from '../components/Timeline'
import PrizeSection from '../components/PrizeSection'
import FinalCTA from '../components/FinalCTA'

export default function Home() {
  return (
    <main>
      <Hero />
      <EventIntro />
      <ChallengeCards />
      <WhyParticipate />
      <Timeline />
      <PrizeSection />
      <FinalCTA />
    </main>
  )
}
