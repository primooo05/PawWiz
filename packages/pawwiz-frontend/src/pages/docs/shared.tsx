import { useState } from 'react';

export const TEAL = '#2ec4b6';

/** Neo-brutalist section wrapper with a hard-shadow card. */
export function SectionCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <div className="relative p-6 md:p-10 bg-white border-2 border-slate-900 rounded-[2rem] md:rounded-[2.5rem] shadow-[6px_6px_0_0_rgba(15,23,42,1)]">
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]" style={{ color: TEAL }}>
          {eyebrow}
        </span>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-slate-900 mt-1 mb-6">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Small brutalist button that copies the given text to the clipboard. */
export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label ? `Copy ${label}` : `Copy ${value}`}
      title={copied ? 'Copied!' : 'Copy'}
      className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 border-2 border-slate-900 rounded-md text-[10px] font-black uppercase tracking-wider bg-white hover:bg-slate-100 active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
      style={copied ? { backgroundColor: TEAL, color: '#fff' } : undefined}
    >
      {copied ? '✓ Copied' : '⧉ Copy'}
    </button>
  );
}

/** Monospace code block with brutalist framing. */
export function Code({ code, lang = 'ts' }: { code: string; lang?: string }) {
  return (
    <div className="border-2 border-slate-900 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{lang}</span>
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400" />
          <span className="w-3 h-3 rounded-full bg-yellow-400" />
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TEAL }} />
        </div>
      </div>
      <pre className="bg-slate-950 text-slate-100 text-[11px] md:text-xs leading-relaxed p-4 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
