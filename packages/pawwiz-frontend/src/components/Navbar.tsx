

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200/40 bg-white/75 backdrop-blur-md sticky top-0 z-40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-2 group cursor-pointer">
          <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🐾</span>
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
            PawWiz
          </span>
        </div>
        
        {/* Navigation Actions */}
        <div className="flex items-center space-x-8">
          <a href="#home" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Home</a>
          <a href="#monitoring" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Monitoring</a>
          <a href="#diet" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Diet</a>
          <a href="#activities" className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors">Activities</a>
          <button className="bg-[#e9c46a] hover:bg-[#e2b74c] active:scale-95 text-slate-900 font-extrabold px-5 py-2 rounded-xl text-xs tracking-wider transition-all shadow-sm hover:shadow-[0_4px_12px_rgba(233,196,106,0.25)] hover:-translate-y-0.5">
            SIGN IN
          </button>
        </div>
      </div>
    </nav>
  );
}
