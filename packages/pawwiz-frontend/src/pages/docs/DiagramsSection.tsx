import { useState } from 'react';
import { SectionCard } from './shared';

const TEAL = '#2ec4b6';

const PIPELINE = [
  { stage: 'Client', detail: 'React hook (useDietPlanner) → fetch /api/diet/profiles' },
  { stage: 'nginx', detail: 'Reverse proxy: TLS termination + routes /api/* to the backend (same-origin, no CORS in prod)' },
  { stage: 'Middleware', detail: 'CORS → Helmet → RateLimiter → Honeypot → Auth (JWT) → Zod validate' },
  { stage: 'Route', detail: 'diet.routes.ts maps the verb/path to the controller' },
  { stage: 'Controller', detail: 'diet.controller.ts unwraps request, calls the service (withErrorHandling)' },
  { stage: 'Service', detail: 'diet.service.ts runs RER math + Gemini enrichment' },
  { stage: 'Repository', detail: 'Prisma reads/writes Profile + Cat records' },
  { stage: 'Response', detail: 'Typed payload flows back through nginx to the client' },
];

function RequestSimulator() {
  const [step, setStep] = useState(-1);
  const running = step >= 0 && step < PIPELINE.length;

  function play() {
    setStep(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      if (i >= PIPELINE.length) {
        clearInterval(timer);
      }
      setStep(i);
    }, 650);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={play}
          className="px-5 py-3 bg-teal-500 text-white border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-teal-600 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          ▶ Trace a request
        </button>
        <button
          type="button"
          onClick={() => setStep(-1)}
          className="px-5 py-3 bg-white text-slate-700 border-2 border-slate-900 rounded-2xl font-black uppercase text-xs tracking-wider shadow-[3px_3px_0_0_rgba(15,23,42,1)] hover:bg-slate-100 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer"
        >
          Reset
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {running ? `Stage ${step + 1} / ${PIPELINE.length}` : step >= PIPELINE.length ? 'Complete' : 'Idle'}
        </span>
      </div>

      <ol className="space-y-3">
        {PIPELINE.map((p, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li
              key={p.stage}
              className={`flex items-start gap-4 p-4 border-2 rounded-2xl transition-all ${
                active
                  ? 'border-slate-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] -translate-y-0.5'
                  : 'border-slate-200'
              }`}
              style={active ? { backgroundColor: '#EEF9F8' } : done ? { backgroundColor: '#f8fafc' } : undefined}
            >
              <span
                className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-black"
                style={{ backgroundColor: active || done ? TEAL : '#fff', color: active || done ? '#fff' : '#0f172a' }}
              >
                {done ? '✓' : i + 1}
              </span>
              <div>
                <p className="font-black uppercase text-sm tracking-tight text-slate-900">{p.stage}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{p.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function DiagramsSection() {
  return (
    <SectionCard id="diagrams" eyebrow="Section 05" title="Interactive Diagrams">
      <p className="text-sm text-slate-600 font-medium mb-6">
        Trace a request from the browser, through the nginx reverse proxy, into the MRSC layering
        (Middleware → Routes → Services → Controllers, with Repositories for data access). Press
        play to watch a diet request move through the stack.
      </p>
      <RequestSimulator />
    </SectionCard>
  );
}
