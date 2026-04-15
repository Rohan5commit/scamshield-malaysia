import { useDeferredValue } from 'react';
import { motion } from 'framer-motion';
import { Search, Send, Sparkles } from 'lucide-react';

import { formatDate } from '../lib/helpers.js';

export default function CommunityFeed({
  reports,
  loading,
  searchQuery,
  setSearchQuery,
  reportForm,
  setReportForm,
  onSubmitReport,
  reportSubmitting,
  reportMessage,
  onUseLatestAnalysis
}) {
  const deferredQuery = useDeferredValue(searchQuery);

  return (
    <section id="community" className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[1.05fr,0.95fr] lg:px-8">
      <div className="panel rounded-[2rem] p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Community intelligence</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">Search scam patterns already reported</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
            Query: {deferredQuery || 'all'}
          </div>
        </div>

        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]" size={18} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search parcel scams, Maybank phishing, TNG, job scams…"
            className="input-shell pl-11"
          />
        </label>

        <div className="mt-5 grid gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[1.4rem] bg-white/6" />
            ))
          ) : reports.length === 0 ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/4 p-6 text-sm leading-6 text-[color:var(--text-muted)]">
              No matching reports yet. Try a broader keyword or submit the current scam pattern as a privacy-safe report.
            </div>
          ) : (
            reports.map((report, index) => (
              <motion.article
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    {report.category}
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-[color:var(--text-muted)]">
                    {report.channel}
                  </span>
                  <span className="text-xs text-[color:var(--text-muted)]">{formatDate(report.reportedAt)}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[color:var(--text-strong)]">{report.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-muted)]">{report.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(report.tags ?? []).map((tag) => (
                    <span key={`${report.id}-${tag}`} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            ))
          )}
        </div>
      </div>

      <div className="panel rounded-[2rem] p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Submit report</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">Add anonymized signal back into the feed</h2>
          </div>
          <button type="button" onClick={onUseLatestAnalysis} className="tag-chip">
            <Sparkles size={14} />
            Use latest analysis
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-[color:var(--text-strong)]">
          ScamShield stores privacy-safe summaries only. Remove IC numbers, bank account numbers, or anything that can
          directly identify a victim before submitting.
        </div>

        <div className="mt-5 grid gap-4">
          <textarea
            value={reportForm.description}
            onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe the scam pattern in a privacy-safe way."
            className="input-shell min-h-36 resize-none"
          />

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={reportForm.channel}
              onChange={(event) => setReportForm((current) => ({ ...current, channel: event.target.value }))}
              className="input-shell"
            >
              {['sms', 'whatsapp', 'telegram', 'phone', 'email', 'website', 'social', 'marketplace', 'other'].map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
            <input
              value={reportForm.locationHint}
              onChange={(event) => setReportForm((current) => ({ ...current, locationHint: event.target.value }))}
              placeholder="Location hint e.g. Klang Valley"
              className="input-shell"
            />
          </div>

          <input
            value={reportForm.category}
            onChange={(event) => setReportForm((current) => ({ ...current, category: event.target.value }))}
            placeholder="Category hint e.g. parcel, bank-phishing, job-scam"
            className="input-shell"
          />

          <input
            value={reportForm.tags}
            onChange={(event) => setReportForm((current) => ({ ...current, tags: event.target.value }))}
            placeholder="Comma-separated tags"
            className="input-shell"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[color:var(--text-muted)]">{reportMessage}</p>
          <button
            type="button"
            onClick={() => void onSubmitReport()}
            disabled={reportSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Send size={16} />
            {reportSubmitting ? 'Submitting…' : 'Submit report'}
          </button>
        </div>
      </div>
    </section>
  );
}

