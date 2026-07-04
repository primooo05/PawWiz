import { useHashScroll } from '../hooks/ui/useHashScroll.js';
import Hero from '../components/features/landing/Hero';
import PregnancySection from '../components/features/landing/PregnancySection';
import DietSection from '../components/features/landing/DietSection';
import BehaviorSection from '../components/features/landing/BehaviorSection';
import ContactSection from '../components/features/landing/ContactSection';
import { API_BASE } from '../lib/config.js';

export default function Home() {
  useHashScroll();

  return (
    <>
      <Hero apiBase={API_BASE} />
      <PregnancySection />
      <DietSection />
      <BehaviorSection apiBase={API_BASE} />
      <ContactSection />
    </>
  );
}
