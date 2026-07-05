import { useBodyScrollLock } from '../../hooks/ui/useBodyScrollLock';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-3xl w-full border border-slate-200/60 shadow-2xl relative animate-scaleUp max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Custom Cat-Themed Scroll/Document SVG */}
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#e9c46a]" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 30 30 L 20 5 L 45 20" />
              <path d="M 70 30 L 80 5 L 55 20" />
              <path d="M 25 30 L 75 30 L 75 85 C 75 89 71 92 67 92 L 33 92 C 29 92 25 89 25 85 Z" fill="currentColor" fillOpacity="0.1" />
              <line x1="38" y1="48" x2="62" y2="48" strokeWidth="6" />
              <line x1="38" y1="62" x2="62" y2="62" strokeWidth="6" />
              <line x1="38" y1="76" x2="52" y2="76" strokeWidth="6" />
            </svg>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">Terms of Service</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">PawWiz Legal Framework & Disclaimers</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-600 text-sm leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M17 11l2 2 4-4" />
                </svg>
              </span>
              1. Acceptance of Terms
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              By accessing, browsing, or utilizing the PawWiz (also referred to as Pawwise) platform, you acknowledge that you have read, understood, and unconditionally agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from using the platform.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </span>
              2. Description of Service
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              PawWiz is a specialized digital resource providing tools such as plant toxicity verification guides, feline pregnancy tracking calculators, and generative behavioral analysis. You explicitly understand that PawWiz is strictly an informational and reference utility, and does NOT substitute for professional veterinary evaluations.
            </p>
          </div>

          {/* Section 3: Medical Disclaimer (Critical / Standout Card) */}
          <div className="bg-amber-50 border border-amber-200 hover:border-amber-300 rounded-2xl p-5 flex gap-3.5 items-start group transition-all duration-300 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-amber-900 uppercase tracking-wider">
                3. Medical Disclaimer (Critical)
              </h4>
              <p className="text-xs text-amber-850 leading-relaxed font-medium">
                Pawwise provides general informational content about cat health, behavior, nutrition, and plant toxicity. It is not a substitute for professional veterinary diagnosis, treatment, or emergency care. Toxicity verdicts, AI-generated behavior explanations, and feeding suggestions are for informational purposes only. Always consult a licensed veterinarian for medical concerns, especially in suspected poisoning or emergency situations.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              4. User Accounts
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              To save pet profiles, milestone calculations, and logs, you may need to register an account. You agree to provide accurate, current, and complete details during account creation. Each user is permitted exactly one (1) account. You are responsible for safeguarding your login credentials.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              5. Acceptable Use
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              You agree to use PawWiz strictly for standard feline monitoring and informational queries. You shall not misuse the AI behavior explainer or plant checking interface to submit unrelated, malicious, or harmful assets. Scraping, reverse engineering, indexing, or commercial resale of the database curated within the app is strictly prohibited.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
              </span>
              6. AI-Generated Content Disclaimer
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              Portions of the behavior analysis, translation recommendations, and toxicity details are compiled using automated LLMs (including the Google Gemini API pipeline). These tools may produce inaccurate or hallucinated conclusions. You are solely responsible for cross-referencing critical feline health indices with offline sources.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9.354a4 4 0 1 0 0 5.292" />
                </svg>
              </span>
              7. Intellectual Property
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              All branding materials, custom user interfaces, application logic, code sequences, custom illustrations, and curations are the exclusive intellectual property of PawWiz. Any data aggregated or processed from the ASPCA Toxic and Non-Toxic Plants database is presented with explicit attribution and remains the intellectual asset of the ASPCA.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H7M4.5 10.5L7 5l2.5 5.5zM14.5 10.5l2.5-5.5 2.5 5.5z" />
                </svg>
              </span>
              8. Limitation of Liability
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              To the maximum extent permitted by law, PawWiz, its developers, operators, and affiliates shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use of, or inability to use, the platform, including but not limited to reliance on botanical verification outcomes or behavioral suggestions.
            </p>
          </div>

          {/* Section 9 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" />
                </svg>
              </span>
              9. Termination
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              We reserve the absolute right to suspend, lock, or permanently delete user accounts at our discretion, without prior notification, for violations of these Terms of Service, abusive behaviors, or actions that compromise platform integrity.
            </p>
          </div>

          {/* Section 10 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2L2 14.5M16 3.5l10 10M10.5 6L21 16.5M19 21h3M2 21h15" />
                </svg>
              </span>
              10. Governing Law
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              These Terms of Service shall be governed by, construed, and enforced in accordance with the regulatory legal regimes detailed within our Privacy Policy (including RA 10173 in the Philippines, GDPR in the European Union, and CCPA/CPRA in California), corresponding directly to your local operating jurisdiction.
            </p>
          </div>

          {/* Section 11 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#e9c46a]/15 group-hover:text-[#e9c46a] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </span>
              11. Changes to Terms
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              We reserve the right, at our sole discretion, to modify or replace these Terms of Service at any time. Significant changes will be announced on the user dashboard interface or via registered email notifications. Continued use of PawWiz after modification logs constitutes complete acceptance of the updated terms.
            </p>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-100 cursor-pointer shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px]"
          >
            I Accept
          </button>
        </div>

      </div>
    </div>
  );
}
