import { CopyButton, Code, SectionCard, TEAL } from './shared';

const ENV_VARS = [
  { key: 'DATABASE_URL', scope: 'Backend', required: 'Required', note: 'PostgreSQL connection string (Supabase pooler). Used by Prisma ORM.' },
  { key: 'DIRECT_URL', scope: 'Backend', required: 'Required', note: 'Direct (non-pooled) PostgreSQL URL for Prisma migrations.' },
  { key: 'SHADOW_DATABASE_URL', scope: 'Backend', required: 'Optional', note: 'Shadow database for Prisma diff-based migrations (Neon).' },
  { key: 'GEMINI_API_KEY', scope: 'Backend', required: 'Optional', note: 'Google Gemini 2.5 Flash — plant vision & diet enrichment. Gracefully mocks when absent.' },
  { key: 'GROQ_API_KEY', scope: 'Backend', required: 'Optional', note: 'Groq LLM API — behavior decoder chat completions.' },
  { key: 'PLANTNET_API_KEY', scope: 'Backend', required: 'Optional', note: 'Pl@ntNet image recognition API for plant identification.' },
  { key: 'PERENUAL_API_KEY', scope: 'Backend', required: 'Optional', note: 'Perenual plant database API — supplementary plant data.' },
  { key: 'SUPABASE_JWT_SECRET', scope: 'Backend', required: 'Required', note: 'Verifies Supabase-issued JWTs in the auth middleware.' },
  { key: 'SUPABASE_URL', scope: 'Backend', required: 'Required', note: 'Supabase project URL for server-side SDK calls.' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', scope: 'Backend', required: 'Required', note: 'Service-role key for admin Supabase operations (e.g. OTP).' },
  { key: 'GMAIL_USER', scope: 'Backend', required: 'Required', note: 'Gmail address for transactional email (OTP delivery).' },
  { key: 'GMAIL_APP_PASSWORD', scope: 'Backend', required: 'Required', note: 'Gmail App Password for SMTP authentication.' },
  { key: 'NODE_ENV', scope: 'Backend', required: 'Optional', note: 'Runtime environment flag (development | production).' },
  { key: 'VITE_SUPABASE_URL', scope: 'Frontend', required: 'Required', note: 'Supabase project URL (client-side auth & realtime).' },
  { key: 'VITE_SUPABASE_ANON_KEY', scope: 'Frontend', required: 'Required', note: 'Supabase publishable/anon key for frontend SDK.' },
];

export function EnvironmentSection() {
  return (
    <SectionCard id="environment" eyebrow="Section 02" title="Environment Variables">
      <p className="text-sm text-slate-600 font-medium mb-6">
        Load them either from a single root <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env</code> file
        (copy <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">.env.example</code> at the repo root) or inject
        at dev time via Infisical (<code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded">infisical run --</code>).
        The backend degrades gracefully to mocks when optional AI keys are absent.
      </p>
      <div className="border-2 border-slate-900 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-100 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-black">Variable</th>
              <th className="px-4 py-3 font-black">Scope</th>
              <th className="px-4 py-3 font-black">Required</th>
              <th className="px-4 py-3 font-black">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100 bg-white">
            {ENV_VARS.map((v) => (
              <tr key={v.key}>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-bold text-slate-900">{v.key}</span>
                    <CopyButton value={v.key} label={v.key} />
                  </div>
                </td>
                <td className="px-4 py-3 font-bold text-slate-600">{v.scope}</td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                    style={
                      v.required === 'Required'
                        ? { backgroundColor: TEAL, color: '#fff' }
                        : { backgroundColor: '#e2e8f0', color: '#475569' }
                    }
                  >
                    {v.required}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 font-medium">{v.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Code
          lang="bash"
          code={`# 1. install deps (npm workspaces)\nnpm install\n\n# 2. set up env — copy the single root template, then fill in values\ncp .env.example .env\n\n# 3a. run migrations + start (LOCAL root .env, no Infisical)\nnpm run prisma:deploy -w packages/pawwiz-backend\nnpm run dev:local\n\n# 3b. or, using Infisical for secret injection\ninfisical run -- npx prisma migrate deploy -w packages/pawwiz-backend\nnpm run dev\n\n# frontend → localhost:5173   backend → localhost:3001`}
        />
      </div>
    </SectionCard>
  );
}
