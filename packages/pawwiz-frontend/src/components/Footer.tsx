

import { useState } from 'react';
import PrivacyModal from './footer/PrivacyModal';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-slate-200/80 bg-slate-50 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-slate-700">PawWiz</span>
          </div>
          <div className="flex space-x-6">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <a href="#terms" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#aspca" className="hover:text-slate-600 transition-colors">ASPCA</a>
            <a href="#contact" className="hover:text-slate-600 transition-colors">Contact us</a>
          </div>
        </div>
      </footer>
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
}

