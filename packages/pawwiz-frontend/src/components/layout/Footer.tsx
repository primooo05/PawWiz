

import { useState } from 'react';
import { Link } from 'react-router-dom';
import PrivacyModal from '../footer/PrivacyModal';
import TermsModal from '../footer/TermsModal';
import DataSourcesModal from '../footer/DataSourcesModal';

export default function Footer() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDataSourcesOpen, setIsDataSourcesOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-slate-200/80 bg-slate-50 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-lg">🐾</span>
            <span className="font-bold text-slate-700">PawWiz</span>
          </div>
          <div className="flex space-x-6">
            <Link
              to="/docs"
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Docs
            </Link>
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Terms
            </button>
            <button
              onClick={() => setIsDataSourcesOpen(true)}
              className="hover:text-slate-600 transition-colors cursor-pointer"
            >
              Data Sources
            </button>
          </div>
        </div>
      </footer>
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <DataSourcesModal isOpen={isDataSourcesOpen} onClose={() => setIsDataSourcesOpen(false)} />
    </>
  );
}

