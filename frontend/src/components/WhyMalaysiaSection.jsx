import { Landmark, Shield, SmartphoneCharging, Siren } from 'lucide-react';

const cards = [
  {
    title: 'Payment trust is local',
    body: 'DuitNow, e-wallets, and bank alerts feel routine in Malaysia, which makes scam prompts harder to spot at first glance.',
    icon: SmartphoneCharging
  },
  {
    title: 'Authority impersonation is effective',
    body: 'Bank Negara, PDRM, LHDN, and KWSP themes still create fear-driven compliance when a victim is rushed.',
    icon: Landmark
  },
  {
    title: 'Reporting needs less friction',
    body: 'Victims and witnesses should be able to contribute safe, searchable signals without exposing personal details.',
    icon: Shield
  },
  {
    title: 'Response speed matters',
    body: 'ScamShield points users toward fast next steps like official verification, bank contact, and NSRC 997 escalation.',
    icon: Siren
  }
];

export default function WhyMalaysiaSection() {
  return (
    <section id="malaysia" className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
      <div className="panel rounded-[2rem] p-6 md:p-7">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Why this matters</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-3xl text-2xl font-semibold text-[color:var(--text-strong)] md:text-3xl">
            Built for Malaysian scam realities, not generic internet risk scoring.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
            The product narrative is local on purpose: parcels, wallets, agencies, job scams, banks, and fast-response
            remediation that maps to what users actually face.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[color:var(--text-strong)]">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

