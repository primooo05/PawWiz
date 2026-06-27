import Hero from '../components/landing/Hero';
import PregnancySection from '../components/landing/PregnancySection';
import DietSection from '../components/landing/DietSection';
import BehaviorSection from '../components/landing/BehaviorSection';
import ContactSection from '../components/landing/ContactSection';

const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';

export default function Home() {
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
