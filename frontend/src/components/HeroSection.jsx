import { motion } from 'framer-motion';
import { ArrowRight, ShieldAlert, Waypoints, UsersRound } from 'lucide-react';

const stats = [
  {
    title: 'Multimodal detection',
    body: 'Text, URLs, phone numbers, and screenshots in one trust-and-safety flow.',
    icon: ShieldAlert
  },
  {
    title: 'Malaysia-aware reasoning',
    body: 'Grounded in common scam narratives tied to wallets, banks, parcel flows, and agencies.',
    icon: Waypoints
  },
  {
    title: 'Community intelligence',
    body: 'Privacy-safe reports turn isolated incidents into searchable scam patterns.',
    icon: UsersRound
  }
];

export default function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-8 pt-10 lg:grid-cols-[1.15fr,0.85fr] lg:px-8 lg:pt-14">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <div className="panel-strong relative overflow-hidden rounded-[2rem] p-7 md:p-9">
          <div className="absolute -right-14 top-0 h-40 w-40 rounded-full bg-teal-300/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-orange-300/18 blur-3xl" />
          <p className="mb-4 inline-flex rounded-full bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-teal-100/75">
            Secure Digital • FinTech & Security
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Stop Malaysian scams before the tap, reply, or transfer.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/88 md:text-lg">
            ScamShield Malaysia turns suspicious messages, spoofed links, caller numbers, and screenshots into a
            structured risk assessment with clear red flags, recommended action, and a community intelligence loop.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {['Risk score + confidence', 'Malaysia-specific context', 'Mock mode demo ready', 'Cloud Run compatible'].map((item) => (
              <span key={item} className="stat-chip">
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-100/80">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-300/18 px-3 py-2">
              <ArrowRight size={14} />
              AI-first workflow, not a chatbot wrapper
            </span>
            <span className="rounded-full border border-white/12 px-3 py-2">Built for judges, users, and live demo stability</span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              className="panel rounded-[1.6rem] p-5"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-teal-200">
                <Icon size={22} />
              </div>
              <h2 className="text-lg font-semibold text-[color:var(--text-strong)]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{item.body}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

