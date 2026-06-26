import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-3xl w-full border border-slate-200/60 shadow-2xl relative animate-scaleUp max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {/* Custom Cat-Themed Privacy Shield SVG */}
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-[#2ec4b6]" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 25 35 L 15 10 L 45 25" />
              <path d="M 75 35 L 85 10 L 55 25" />
              <path d="M 20 35 C 20 35 50 30 50 30 C 50 30 80 35 80 35 C 80 65 70 85 50 95 C 30 85 20 65 20 35 Z" fill="currentColor" fillOpacity="0.1" />
              <path d="M 38 58 L 47 66 L 62 48" strokeWidth="8" />
            </svg>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-none">Privacy Policy</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">PawWiz Privacy Shield & Terms</p>
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
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 text-slate-600 text-sm leading-relaxed">
          
          {/* Intro Warning */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 items-start">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2ec4b6] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <p className="text-xs text-emerald-800 font-medium">
              Because PawWiz handles vital pet health records, potential user health-adjacent data, and generative AI models, we prioritize rigorous transparency and safety constraints to protect your feline companion's information.
            </p>
          </div>

          {/* Section 1 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="9" />
                  <line x1="9" y1="13" x2="15" y2="13" />
                  <line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              </span>
              1. What We Collect
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              We process information necessary to calculate gestation milestones, decode cat behaviors, and verify botanical plant toxicity:
            </p>
            <ul className="list-disc pl-14 text-xs text-slate-500 space-y-1">
              <li><strong>Account Credentials:</strong> Basic details (email address, full name) when registering for profile backups.</li>
              <li><strong>Feline Profiles:</strong> Specific inputs (name, breed, age, sex, medical histories, pregnancy data, milestones).</li>
              <li><strong>Plant Scanner Uploads:</strong> Image files uploaded via the camera interface to check toxicity.</li>
              <li><strong>Usage Footprint:</strong> Navigation statistics, specific features triggered, response click logs.</li>
              <li><strong>Device Telemetry:</strong> Anonymized screen dimensions, browser versions, and network request latencies.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              2. How We Use It
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              Your cat's profile and scanned images are handled according to strict operational goals:
            </p>
            <ul className="list-disc pl-14 text-xs text-slate-500 space-y-1">
              <li><strong>Core Execution:</strong> To trigger plant verification loops, behavior translation queries, and gestation calculator timelines.</li>
              <li><strong>Nutritional Tailoring:</strong> To automatically compute weight-specific caloric targets and feeding routines.</li>
              <li><strong>Diagnostics Optimization:</strong> To refine classification and parsing heuristics via aggregated, telemetry logs.</li>
              <li><strong>Commercial Safeguard:</strong> We strictly <strong>DO NOT</strong> trade, lease, or sell your personal data or your pet's profiles to broker agencies.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A3 3 0 1 0 15 5a3 3 0 0 0 3 3zM6 15a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm12 4a3 3 0 1 0 3-3 3 3 0 0 0-3 3z" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </span>
              3. Third-Party Processing
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              To deliver high-precision answers, specific data segments traverse third-party APIs:
            </p>
            <ul className="list-disc pl-14 text-xs text-slate-500 space-y-1">
              <li><strong>Generative AI & Image Detection:</strong> Uploaded plant photographs and text-based behavior prompts are sent directly to the <strong>Google Gemini API</strong> for computer-vision and language-model inferences. These assets leave our immediate database boundary for active classification.</li>
              <li><strong>Botanical Reference:</strong> Toxic plant identification results are programmatically verified against deterministic scientific records sourced from the <strong>ASPCA Toxic and Non-Toxic Plants database</strong> to eliminate AI hallucination.</li>
              <li><strong>Operational Analytics:</strong> Anonymized sessions may be tracked via standard, cookie-less diagnostic metrics to monitor system stability.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
                </svg>
              </span>
              4. Data Storage & Security
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              Your data is structured and defended with modern engineering standards:
            </p>
            <ul className="list-disc pl-14 text-xs text-slate-500 space-y-1">
              <li><strong>Storage Location:</strong> Production databases are hosted securely inside encrypted regional partitions (Supabase PostgreSQL / AWS cloud hosting).</li>
              <li><strong>Cryptographic Defense:</strong> All data is encrypted in transit via SSL/TLS protocols and at rest using AES-256 standard schemes.</li>
              <li><strong>Lifecycle Limits:</strong> Inactive account profiles are retained for up to 12 months. Users can execute an instant, complete account purge directly from their settings pane.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-4 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </span>
              5. Global & Regional Rights
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              PawWiz aligns with international compliance regimes to respect user self-sovereignty:
            </p>

            {/* Compliance sub-cards */}
            <div className="pl-9 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* PH Card */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current text-[#2ec4b6] fill-none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  Philippines
                </div>
                <p className="text-[10px] text-slate-400 font-medium">RA 10173 (DPA 2012)</p>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Protects your absolute right to access, rectification, objection, erasure, portability, and to file official escalations to the National Privacy Commission (NPC).
                </p>
              </div>

              {/* GDPR Card */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current text-[#2ec4b6] fill-none" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="5" className="fill-current opacity-20" />
                  </svg>
                  European Union
                </div>
                <p className="text-[10px] text-slate-400 font-medium">GDPR Compliant</p>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Enforces complete Right to Erasure, Restriction of processing, Data Portability, and direct objection to automated AI profiling (Articles 15–22).
                </p>
              </div>

              {/* CCPA Card */}
              <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs space-y-1.5">
                <div className="font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-current text-[#2ec4b6] fill-none" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  California, USA
                </div>
                <p className="text-[10px] text-slate-400 font-medium">CCPA/CPRA</p>
                <p className="text-[10px] leading-relaxed text-slate-500">
                  Guarantees your right to know what data we collect, to delete your profiles, and to enforce non-discrimination for exercising rights. We do NOT sell data.
                </p>
              </div>
            </div>

            <div className="pl-9 space-y-2 text-xs text-slate-500">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mt-4">Rights Extended to All Users:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access & Portability:</strong> Obtain a portable, machine-readable package containing your user profile and feline logs.</li>
                <li><strong>Erasure & Correction:</strong> Instantaneously correct wrong parameters or trigger complete profile wipes at any time.</li>
                <li><strong>Consent Withdrawal:</strong> Revoke authorization for camera captures or automated model inputs in settings.</li>
              </ul>
              <p className="text-xs pt-1.5">
                To invoke your rights, submit a query to <a href="mailto:privacy@pawwise.com" className="text-[#2ec4b6] hover:underline font-bold">privacy@pawwise.com</a>. We process requests within required statutory timelines (30 days under RA 10173/GDPR, 45 days under CCPA).
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
              6. Children's Privacy Protection
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              PawWiz is not designed for or targeted at children. We do not knowingly compile or track records belonging to minors under 18 years of age. If we discover a minor's credentials have been stored, we will purge them immediately.
            </p>
          </div>

          {/* Section 7 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
              </span>
              7. Changes to This Policy
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              We update this policy as data laws or model components evolve. All updates are logged directly on this page, and users with valid accounts will be alerted via system dashboard notices.
            </p>
          </div>

          {/* Section 8 */}
          <div className="space-y-3 group border border-slate-100 hover:border-slate-200/80 p-5 rounded-2xl transition-all duration-300 bg-white">
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-slate-50 text-slate-500 group-hover:bg-[#2ec4b6]/10 group-hover:text-[#2ec4b6] transition-colors">
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              8. Privacy Contact
            </h4>
            <p className="text-xs text-slate-500 pl-9">
              For security reports, diagnostic details, data extraction, or NPC/GDPR requests, contact our Compliance team:
            </p>
            <div className="ml-9 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p>PawWiz Legal Compliance Office</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Email Queue: privacy@pawwise.com</p>
              </div>
              <a href="mailto:privacy@pawwise.com" className="bg-[#2ec4b6] hover:bg-[#259b90] text-white text-[10px] font-black px-4 py-2.5 rounded-lg tracking-wider text-center transition-all cursor-pointer">
                SEND MESSAGE
              </a>
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
