import { DatabaseZap, EyeOff, Workflow, CloudCog } from 'lucide-react';

const pillars = [
  {
    title: 'Explainable agentic workflow',
    body: 'The UI is backed by intake, analysis, retrieval, scoring, report generation, and community intelligence stages orchestrated through Genkit.',
    icon: Workflow
  },
  {
    title: 'Privacy-safe reporting',
    body: 'Community submissions are sanitized before storage and can reject risky identifiers such as NRIC or bank-account-like strings.',
    icon: EyeOff
  },
  {
    title: 'Grounded intelligence',
    body: 'Seeded Malaysian scam patterns and community matches influence risk scoring instead of treating the model as the only source of truth.',
    icon: DatabaseZap
  },
  {
    title: 'Deployment-ready engineering',
    body: 'Mock mode works without secrets today, while Docker, CI, and a Cloud Run template keep the production path clean.',
    icon: CloudCog
  }
];

export default function TrustSection() {
  return (
    <section id="trust" className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <div className="panel rounded-[2rem] p-6 md:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Trust, privacy, architecture</p>
        <h2 className="mt-3 text-2xl font-semibold text-[color:var(--text-strong)] md:text-3xl">
          A hackathon demo that still feels production-minded.
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-orange-200">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--text-strong)]">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{pillar.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

