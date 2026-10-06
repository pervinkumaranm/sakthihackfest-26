import Hero from '../components/Hero'
import EventIntro from '../components/EventIntro'
import ChallengeCards from '../components/ChallengeCards'
import WhyParticipate from '../components/WhyParticipate'
import Timeline from '../components/Timeline'
import SponsorCarousel from '../components/SponsorCarousel'
import PrizeSection from '../components/PrizeSection'
import FinalCTA from '../components/FinalCTA'
import RegistrationClosedModal from '../components/RegistrationClosedModal'
import { useAppSettings } from '../context/SettingsContext'

export default function Home() {
  const { registrationOpen } = useAppSettings()
  return (
    <main>
      {!registrationOpen && <RegistrationClosedModal initialOpen={false} />}
      <Hero />
      <EventIntro />
      <ChallengeCards />
      <WhyParticipate />
      <Timeline />
      <SponsorCarousel />
      <PrizeSection />
      <FinalCTA />
    </main>
  )
}
