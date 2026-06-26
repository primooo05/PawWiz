import React, { useState } from 'react';
import akiCat from '../../assets/aki_cat.png';

interface ContactFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  catDetails: string;
  inquiryReason: string;
  budgetTier: string;
  message: string;
}

const BUDGET_TIERS = [
  'Essential',
  'Carefree',
  'Premium',
  'Breeder / Pro',
  'Vet Clinic'
];

export default function ContactSection() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phoneNumber: '',
    catDetails: '',
    inquiryReason: '',
    budgetTier: 'Essential',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.inquiryReason) {
      newErrors.inquiryReason = 'Please select an inquiry reason';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message details are required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Simulate submission
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      catDetails: '',
      inquiryReason: '',
      budgetTier: 'Essential',
      message: '',
    });
    setErrors({});
    setIsSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="contact" className="w-full py-12 md:py-16 bg-[#2ec4b6] flex items-center justify-center px-4 md:px-8">
      {/* Outer Card with curved outline to match image mockup */}
      <div className="w-full max-w-5xl bg-white rounded-3xl md:rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden p-6 md:p-8 flex flex-col justify-between relative">
        
        {!isSubmitted ? (
          <div className="grid md:grid-cols-12 gap-6 items-stretch flex-1">
            {/* Left Column: Headline and Mascot illustration */}
            <div className="md:col-span-5 flex flex-col justify-start gap-y-6 text-left pr-0 md:pr-4">
              <div>
                <h2 className="text-2xl md:text-3.5xl font-black text-slate-900 leading-tight tracking-tight uppercase">
                  Let's Make <span className="text-[#2ec4b6]">Kitty Care</span> Worry-Free.
                </h2>
                <p className="text-sm text-slate-500 mt-3 leading-relaxed font-medium">
                  Have questions about plant safety, diet guidelines, or behavior diagnostics? Tell us about your feline friend, and we will get back to you!
                </p>
              </div>

              {/* Aki the Cat Image Placeholder */}
              <div className="flex flex-col justify-start items-start">
                <div className="w-full max-w-[280px] aspect-square rounded-3xl overflow-hidden border-4 border-slate-100 shadow-md bg-slate-100 flex items-center justify-center">
                  <img src={akiCat} alt="Aki the Cat" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs italic text-slate-500 mt-3 max-w-[280px] leading-relaxed font-medium">
                  This is Aki, the cat of one of the developers and the Project Manager. He will be the one who's gonna talk to you!
                </p>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="md:col-span-7 flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="bg-slate-50/70 p-5 md:p-6 rounded-2xl border border-slate-100 flex flex-col gap-3.5 text-left">
                
                {/* Full name & Email side-by-side or stacked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full name*</label>
                    <input
                      type="text"
                      placeholder="e.g., Juan dela Cruz"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className={`w-full bg-white border-b-2 px-3 py-2 text-sm focus:outline-none transition-colors ${
                        errors.fullName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2ec4b6]'
                      }`}
                    />
                    {errors.fullName && <span className="text-[10px] text-rose-500 font-semibold">{errors.fullName}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email*</label>
                    <input
                      type="email"
                      placeholder="e.g., juan@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full bg-white border-b-2 px-3 py-2 text-sm focus:outline-none transition-colors ${
                        errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2ec4b6]'
                      }`}
                    />
                    {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email}</span>}
                  </div>
                </div>

                {/* Phone & Cat name / breed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone number</label>
                    <input
                      type="tel"
                      placeholder="e.g., +63 917 123 4567"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      className="w-full bg-white border-b-2 border-slate-200 focus:border-[#2ec4b6] px-3 py-2 text-sm focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cat's Name & Breed</label>
                    <input
                      type="text"
                      placeholder="e.g., Luna (Persian)"
                      value={formData.catDetails}
                      onChange={(e) => setFormData({ ...formData, catDetails: e.target.value })}
                      className="w-full bg-white border-b-2 border-slate-200 focus:border-[#2ec4b6] px-3 py-2 text-sm focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Inquiry reason drop down */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Inquiry Reason*</label>
                  <div className="relative">
                    <select
                      value={formData.inquiryReason}
                      onChange={(e) => setFormData({ ...formData, inquiryReason: e.target.value })}
                      className={`w-full bg-white border-b-2 px-3 py-2 text-sm focus:outline-none transition-colors appearance-none cursor-pointer ${
                        errors.inquiryReason ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2ec4b6]'
                      }`}
                    >
                      <option value="">Select a reason</option>
                      <option value="General Support">General Support & Feedback</option>
                      <option value="Veterinary Partnership">Veterinary Partnership</option>
                      <option value="ASPCA Database">ASPCA Database Feedback</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Other">Other / General Question</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {errors.inquiryReason && <span className="text-[10px] text-rose-500 font-semibold">{errors.inquiryReason}</span>}
                </div>

                {/* Care budget tier horizontal selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated Care Support Tier*</label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_TIERS.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setFormData({ ...formData, budgetTier: tier })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          formData.budgetTier === tier
                            ? 'bg-[#2ec4b6] border-[#2ec4b6] text-white shadow-md'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message details text area */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Cat Details & Message*</label>
                  <textarea
                    placeholder="Tell us about the issue or question you have in details..."
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full bg-white border-b-2 px-3 py-2 text-sm focus:outline-none transition-colors resize-none ${
                      errors.message ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-[#2ec4b6]'
                    }`}
                  />
                  {errors.message && <span className="text-[10px] text-rose-500 font-semibold">{errors.message}</span>}
                </div>

                {/* Submit button */}
                <div className="mt-2 text-left">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#2ec4b6] text-white px-6 py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-100 shadow-[0_4px_0_0_#1e9c90] active:shadow-none active:translate-y-[4px] hover:bg-[#39d0c2] cursor-pointer"
                  >
                    Lets Connect
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </button>
                </div>

              </form>
            </div>
          </div>
        ) : (
          /* Thank You success state layout */
          <div className="flex-1 flex flex-col justify-center items-center py-12 text-center max-w-xl mx-auto animate-scaleUp">
            
            {/* Cute robot cat mascot holding envelope SVG */}
            <div className="w-48 h-48 mb-6 flex justify-center items-center">
              <svg className="w-full h-full text-slate-800" viewBox="0 0 200 200" fill="none">
                {/* Robot hover shadow */}
                <ellipse cx="100" cy="175" rx="35" ry="6" fill="#cbd5e1" className="animate-pulse" />
                
                {/* Floating body/pod */}
                <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                  {/* Cat body rounded pod */}
                  <rect x="68" y="70" width="64" height="64" rx="28" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
                  
                  {/* Chest panel screen */}
                  <rect x="80" y="90" width="40" height="28" rx="8" fill="#334155" />
                  {/* Glowing pulse heart wave inside panel */}
                  <path d="M85 104h8l3-8 4 16 3-11 3 3h9" stroke="#2ec4b6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Left robot ear */}
                  <path d="M72 74l-12-16 10 4z" fill="#f8fafc" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />
                  {/* Right robot ear */}
                  <path d="M128 74l12-16-10 4z" fill="#f8fafc" stroke="#334155" strokeWidth="3" strokeLinejoin="round" />

                  {/* LED antennas */}
                  <line x1="82" y1="52" x2="76" y2="40" stroke="#334155" strokeWidth="3" />
                  <circle cx="76" cy="40" r="3.5" fill="#e9c46a" stroke="#334155" strokeWidth="1.5" />
                  <line x1="118" y1="52" x2="124" y2="40" stroke="#334155" strokeWidth="3" />
                  <circle cx="124" cy="40" r="3.5" fill="#e9c46a" stroke="#334155" strokeWidth="1.5" />

                  {/* Face screen visor */}
                  <rect x="76" y="58" width="48" height="24" rx="10" fill="#334155" />
                  {/* Glowing cute robot eyes */}
                  <path d="M85 70c0-3 4-3 4 0M111 70c0-3-4-3-4 0" stroke="#e9c46a" strokeWidth="3" strokeLinecap="round" />
                  {/* Cheerful mouth */}
                  <path d="M96 73a4 4 0 008 0" stroke="#e9c46a" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Flying robot thrusters */}
                  <path d="M82 134l6 14 6-14z" fill="#e9c46a" />
                  <path d="M106 134l6 14 6-14z" fill="#e9c46a" />

                  {/* Left waving arm */}
                  <path d="M68 95c-15-5-22 5-16 12s20 0 16-12z" fill="#f8fafc" stroke="#334155" strokeWidth="3" />

                  {/* Right arm holding mail envelope */}
                  <g transform="translate(122, 94)">
                    {/* Waving right robot arm */}
                    <path d="M0 5c12 2 18 12 18 20 0 3-4 5-6 1C8 20 4 12 0 5z" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
                    {/* Mail envelope */}
                    <g transform="translate(8, 15) rotate(15)">
                      <rect x="0" y="0" width="30" height="20" rx="2" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
                      <path d="M0 0l15 10L30 0" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
                      {/* Heart sealing stamp on envelope */}
                      <path d="M15 11c-1.5-1.5-3 0-3 1.5 0 2 3 3.5 3 3.5s3-1.5 3-3.5c0-1.5-1.5-3-3-1.5z" fill="#f43f5e" />
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Thank you for contacting us!
            </h3>
            <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed max-w-sm mb-8">
              We have received your message.<br />We'll reach out to you immediately!
            </p>

            {/* Redesigned action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto bg-[#e63946] text-white font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider transition-all duration-100 shadow-[0_4px_0_0_#b51a2b] active:shadow-none active:translate-y-[4px] hover:bg-[#f25c66] cursor-pointer uppercase"
              >
                Back to Homepage
              </button>
              <a
                href="#diet"
                onClick={() => setIsSubmitted(false)}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold px-6 py-3 rounded-xl text-xs tracking-wider transition-all duration-100 border border-slate-200/80 text-center uppercase"
              >
                Visit the Blog
              </a>
            </div>

            {/* Let's connect and social icons */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-black tracking-widest text-slate-400 uppercase">Let's connect!</span>
              <div className="flex gap-4">
                {/* Facebook */}
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300 text-slate-400 hover:text-pink-600 transition-all shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* LinkedIn */}
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300 text-slate-400 hover:text-blue-700 transition-all shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300 text-slate-400 hover:text-rose-600 transition-all shadow-sm">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 00-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 002.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 002.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Footer row inside the white card (shows only when not submitted) */}
        {!isSubmitted && (
          <div className="border-t border-slate-100 pt-8 mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
            <div>
              <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">Start a project</span>
              <a href="mailto:sales@pawwiz.com" className="text-xs font-bold text-slate-800 hover:text-[#2ec4b6] transition-colors mt-1 block">sales@pawwiz.com</a>
            </div>
            <div>
              <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">Partner with us</span>
              <a href="mailto:partner@pawwiz.com" className="text-xs font-bold text-slate-800 hover:text-[#2ec4b6] transition-colors mt-1 block">partner@pawwiz.com</a>
            </div>
            <div>
              <span className="block text-[10px] font-black tracking-widest text-slate-400 uppercase">Work with us</span>
              <a href="mailto:career@pawwiz.com" className="text-xs font-bold text-slate-800 hover:text-[#2ec4b6] transition-colors mt-1 block">career@pawwiz.com</a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
