import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface AspcaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AspcaModal({ isOpen, onClose }: AspcaModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-3xl w-full border border-slate-200/60 shadow-2xl relative animate-scaleUp max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Custom Cat-Themed Book/Leaf Database SVG */}
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#2ec4b6]" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 30 30 L 20 5 L 45 20" />
              <path d="M 70 30 L 80 5 L 55 20" />
              <path d="M 25 30 L 75 30 L 75 85 C 75 89 71 92 67 92 L 33 92 C 29 92 25 89 25 85 Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M 50 42 Q 35 55 50 78" strokeWidth="6" />
              <path d="M 50 42 Q 65 55 50 78" strokeWidth="6" />
              <line x1="50" y1="52" x2="50" y2="78" strokeWidth="6" />
              <line x1="50" y1="58" x2="38" y2="52" strokeWidth="5" />
              <line x1="50" y1="66" x2="62" y2="60" strokeWidth="5" />
            </svg>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">Data Sources & Attribution</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">ASPCA Reference Loop & Hotlines</p>
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
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </span>
              1. Where Our Toxicity Data Comes From
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              Pawwise's plant toxicity information is compiled with reference to the ASPCA Animal Poison Control Center's published list of toxic and non-toxic plants for cats. We are not affiliated with, endorsed by, or sponsored by the ASPCA.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              2. Localized & Supplementary Sources
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              Our index includes specialized regional flora common to Philippine households (including Fortune Plants, ZZ Plants, and local caladium varieties) that are not covered under western indices. These localized botanical profiles are curated by our team through academic literature reviews, regional farming bulletins, and direct consultations with licensed Filipino veterinarians.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              3. Data Audit & Update Frequency
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              To remain consistent with evolving toxicological journals and international veterinary reports, our plant safety indices and database files undergo structured reviews and updates quarterly.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              </span>
              4. Database Limitations
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              This database is not exhaustive and should not replace professional veterinary or toxicology advice. If you suspect your cat has ingested a toxic plant, contact your veterinarian or a pet poison hotline immediately.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </span>
              5. Report a Data Error
            </h4>
            <p className="text-xs text-slate-500 pl-9 mb-2">
              Help us crowdsource quality control. If you locate an entry that contains incorrect classification flags, species info, or outdated symptoms, please alert our QA team:
            </p>
            <div className="pl-9">
              <a
                href="mailto:qa@pawwise.com?subject=Toxicity%20Database%20Correction%20Request"
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200/40"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Submit Correction Queue
              </a>
            </div>
          </div>

          {/* Section 6: Emergency Resources (High-Value Standout Card) */}
          <div className="bg-[#2ec4b6]/5 border border-[#2ec4b6]/20 hover:border-[#2ec4b6]/40 rounded-2xl p-5 flex gap-3.5 items-start group transition-all duration-300 shadow-sm">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#2ec4b6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div className="space-y-3 w-full">
              <h4 className="text-sm font-extrabold text-[#259b90] uppercase tracking-wider">
                6. Emergency Resources & Hotlines
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                If your pet shows active signs of poisoning (excessive salivation, vomiting, lethargy, or collapse), contact these resources immediately:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* PH Hotlines */}
                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] text-[#259b90]">Philippines Emergencies</p>
                  <ul className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <li><strong className="text-slate-700">PAWS Clinic:</strong> +(632) 8984-7297</li>
                    <li><strong className="text-slate-700">UP Vet Teaching Hosp:</strong> +(632) 8928-1124</li>
                    <li><strong className="text-slate-700">Animal House 24/7:</strong> +(632) 8893-5872</li>
                    <li><strong className="text-slate-700">VIP (Vets in Practice):</strong> +(632) 8895-9985</li>
                  </ul>
                </div>

                {/* International Hotlines */}
                <div className="bg-white/80 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <p className="font-extrabold text-slate-800 uppercase tracking-wider text-[10px] text-[#259b90]">International Support</p>
                  <ul className="space-y-1 text-[11px] text-slate-500 font-medium">
                    <li><strong className="text-slate-700">ASPCA Poison Control:</strong> +1 (888) 426-4435</li>
                    <li><strong className="text-slate-700">Pet Poison Helpline:</strong> +1 (855) 764-7661</li>
                    <li className="text-[9px] text-slate-400 mt-1 italic">*International fees may apply. Available 24/7/365.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#e9c46a] hover:bg-[#f0cc74] text-slate-900 font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-100 cursor-pointer shadow-[0_4px_0_0_#b8862a] active:shadow-none active:translate-y-[4px]"
          >
            I Understand
          </button>
        </div>

      </div>
    </div>
  );
}
