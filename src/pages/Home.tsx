import Hero from '../components/Hero'
import EventIntro from '../components/EventIntro'
import ChallengeCards from '../components/ChallengeCards'
import WhyParticipate from '../components/WhyParticipate'
import Timeline from '../components/Timeline'
import PrizeSection from '../components/PrizeSection'
import FinalCTA from '../components/FinalCTA'
import RegistrationClosedModal from '../components/RegistrationClosedModal'
import { IS_REGISTRATION_CLOSED } from '../../config/event'

export default function Home() {
  return (
    <main>
      {IS_REGISTRATION_CLOSED && <RegistrationClosedModal initialOpen={true} />}
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
