import { motion } from 'framer-motion';
import { AlertTriangle, BadgeInfo, ShieldCheck, Sparkles } from 'lucide-react';

import { riskTone } from '../lib/helpers.js';
import RiskGauge from './RiskGauge.jsx';

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-8 w-40 animate-pulse rounded-full bg-white/8" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/8" />
        <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/8" />
      </div>
      <div className="h-28 animate-pulse rounded-[1.5rem] bg-white/8" />
    </div>
  );
}

export default function ResultPanel({ result, loading, error }) {
  if (loading) {
    return (
      <div className="panel h-full rounded-[2rem] p-6 md:p-7">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel h-full rounded-[2rem] p-6 md:p-7">
        <div className="rounded-[1.5rem] border border-rose-400/20 bg-rose-500/10 p-5 text-sm leading-6 text-rose-100">
          <div className="mb-2 flex items-center gap-2 text-base font-semibold">
            <AlertTriangle size={18} />
            Unable to complete analysis
          </div>
          {error}
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="panel flex h-full flex-col justify-between rounded-[2rem] p-6 md:p-7">
        <div>
          <div className="mb-4 inline-flex rounded-full bg-white/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">
            Structured output
          </div>
          <h3 className="text-2xl font-semibold text-[color:var(--text-strong)]">A result panel judges can read in seconds.</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
            Submit a message, URL, phone number, or screenshot to produce a calibrated risk score, Malaysia-specific
            explanation, recommended actions, and a community-ready summary.
          </p>
        </div>
        <div className="mt-8 grid gap-3">
          {['Risk score and verdict', 'Red flags and reason trace', 'Recommended actions', 'Seed and community matches'].map((item) => (
            <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-[color:var(--text-muted)]">
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const tone = riskTone(result.riskScore);

  return (
    <motion.div
      key={result.requestId}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="panel rounded-[2rem] p-6 md:p-7"
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-5">
          <div className="mb-5 flex items-center justify-between">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ background: tone.soft, color: tone.accent }}
            >
              {result.verdict}
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              {result.providerMode}
            </span>
          </div>
          <RiskGauge score={result.riskScore} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Confidence</p>
              <p className="mt-2 font-mono text-2xl font-semibold text-[color:var(--text-strong)]">{result.confidence}%</p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-3">
              <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Category</p>
              <p className="mt-2 text-base font-semibold capitalize text-[color:var(--text-strong)]">{result.category.replace(/-/g, ' ')}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              <BadgeInfo size={15} />
              Explanation
            </div>
            <p className="text-lg font-semibold text-[color:var(--text-strong)]">{result.conciseExplanation}</p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">{result.malaysiaContext}</p>
            <p className="mt-4 rounded-[1.3rem] border border-white/8 bg-black/10 px-4 py-3 font-mono text-xs leading-6 text-[color:var(--text-muted)]">
              {result.scoreExplanation}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                <AlertTriangle size={15} />
                Red flags
              </div>
              <div className="space-y-3">
                {result.redFlags.map((flag) => (
                  <div key={flag} className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[color:var(--text-strong)]">
                    {flag}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                <ShieldCheck size={15} />
                Recommended action
              </div>
              <div className="rounded-[1.3rem] border border-emerald-400/20 bg-emerald-400/10 p-4">
                <ul className="space-y-3 text-sm leading-6 text-[color:var(--text-strong)]">
                  {result.recommendedActions.map((action) => (
                    <li key={action} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            <Sparkles size={15} />
            Score composition
          </div>
          {Object.entries(result.scoreComposition).map(([label, value]) => (
            <div key={label} className="mb-3 last:mb-0">
              <div className="mb-2 flex items-center justify-between text-sm text-[color:var(--text-muted)]">
                <span className="capitalize">{label}</span>
                <span className="font-mono">{value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-300 via-sky-300 to-orange-300" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Seeded matches</h4>
              <div className="space-y-3">
                {result.matches.seed.length === 0 ? (
                  <p className="text-sm text-[color:var(--text-muted)]">No strong dataset match found.</p>
                ) : (
                  result.matches.seed.map((match) => (
                    <div key={match.id} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[color:var(--text-strong)]">{match.title}</p>
                        <span className="font-mono text-xs text-[color:var(--text-muted)]">{Math.round(match.score * 100)}%</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{match.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--text-muted)]">Community matches</h4>
              <div className="space-y-3">
                {result.matches.community.length === 0 ? (
                  <p className="text-sm text-[color:var(--text-muted)]">No community pattern match yet.</p>
                ) : (
                  result.matches.community.map((match) => (
                    <div key={match.id} className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[color:var(--text-strong)]">{match.title}</p>
                        <span className="font-mono text-xs text-[color:var(--text-muted)]">{Math.round(match.score * 100)}%</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{match.summary}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

