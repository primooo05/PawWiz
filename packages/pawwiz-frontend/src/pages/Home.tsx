import { useHashScroll } from '../hooks/useHashScroll';
import Hero from '../components/landing/Hero';
import PregnancySection from '../components/landing/PregnancySection';
import DietSection from '../components/landing/DietSection';
import BehaviorSection from '../components/landing/BehaviorSection';
import ContactSection from '../components/landing/ContactSection';
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
