

export default function Navbar() {
  return (
    <nav className="border-b border-slate-200/80 bg-white/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
            PawWiz
          </span>
        </div>
        <div className="flex items-center space-x-8">
          <a href="#home" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Home</a>
          <a href="#monitoring" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Monitoring</a>
          <a href="#diet" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Diet</a>
          <button className="bg-[#e9c46a] hover:bg-[#e2b74c] text-slate-900 font-black px-5 py-2 rounded-lg text-xs tracking-wider transition-colors shadow-sm">
            SIGN IN
          </button>
        </div>
      </div>
    </nav>
  );
}
