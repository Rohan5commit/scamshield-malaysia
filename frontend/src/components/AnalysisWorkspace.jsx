import { startTransition, useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Link2, MessageSquareText, PhoneCall, UploadCloud, WandSparkles } from 'lucide-react';

import { MODE_OPTIONS, cn, loadDemoAsset } from '../lib/helpers.js';
import ResultPanel from './ResultPanel.jsx';

const ICONS = {
  text: MessageSquareText,
  url: Link2,
  phone: PhoneCall,
  image: ImagePlus
};

function inputPlaceholder(mode) {
  switch (mode) {
    case 'url':
      return 'Paste a suspicious link or domain';
    case 'phone':
      return 'Enter the caller number or WhatsApp number';
    case 'image':
      return 'Optional note about what the screenshot shows';
    default:
      return 'Paste the suspicious text message, email, or chat';
  }
}

export default function AnalysisWorkspace({
  mode,
  setMode,
  content,
  setContent,
  notes,
  setNotes,
  file,
  setFile,
  onAnalyze,
  loading,
  result,
  error,
  samples
}) {
  const [sampleBusyId, setSampleBusyId] = useState(null);

  async function applySample(sample) {
    setSampleBusyId(sample.id);
    try {
      if (sample.kind === 'image') {
        const demoFile = await loadDemoAsset(sample.id);
        startTransition(() => {
          setMode('image');
          setFile(demoFile);
          setContent('');
          setNotes(sample.content);
        });
        return;
      }

      startTransition(() => {
        setMode(sample.kind);
        setFile(null);
        setContent(sample.content);
        setNotes('');
      });
    } finally {
      setSampleBusyId(null);
    }
  }

  return (
    <section id="analyze" className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[0.95fr,1.05fr] lg:px-8">
      <div className="panel rounded-[2rem] p-6 md:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-[color:var(--text-muted)]">Analysis console</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-strong)]">Multimodal scam intake</h2>
          </div>
          <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)] md:block">
            Mock-mode safe
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODE_OPTIONS.map((option) => {
            const Icon = ICONS[option.id];
            const active = option.id === mode;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setMode(option.id);
                  if (option.id !== 'image') {
                    setFile(null);
                  }
                }}
                className={cn(
                  'rounded-[1.4rem] border px-4 py-4 text-left transition',
                  active
                    ? 'border-teal-300/40 bg-teal-300/14 text-[color:var(--text-strong)]'
                    : 'border-white/10 bg-white/5 text-[color:var(--text-muted)] hover:bg-white/8'
                )}
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/15">
                  <Icon size={18} />
                </div>
                <div className="text-sm font-semibold">{option.label}</div>
                <div className="mt-1 text-xs leading-5">{option.hint}</div>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {samples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => void applySample(sample)}
              className="tag-chip"
              disabled={sampleBusyId === sample.id}
            >
              {sampleBusyId === sample.id ? 'Loading…' : sample.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4">
          {mode === 'image' ? (
            <label className="group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-[1.7rem] border border-dashed border-white/15 bg-white/4 p-6 text-center transition hover:bg-white/8">
              <UploadCloud className="mb-4 text-teal-200" size={34} />
              <p className="text-lg font-semibold text-[color:var(--text-strong)]">Drop a screenshot or choose a file</p>
              <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--text-muted)]">
                Upload scam chats, wallet prompts, or phishing page screenshots. In mock mode, the filename and notes
                still drive a realistic demo response.
              </p>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                }}
              />
              <span className="mt-5 rounded-full border border-white/12 px-3 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
                {file ? `${file.name} selected` : 'PNG, JPG, WEBP, SVG'}
              </span>
            </label>
          ) : (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={inputPlaceholder(mode)}
              className="input-shell min-h-44 resize-none"
            />
          )}

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={mode === 'image' ? 'Add context, such as what the screenshot claims or asks you to do.' : 'Optional context for the analysis.'}
            className="input-shell min-h-28 resize-none"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
            The output is schema-validated JSON from an agentic pipeline combining heuristics, retrieval, and a
            provider layer that can switch between mock mode and Gemini.
          </p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => void onAnalyze()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <WandSparkles size={18} />
            {loading ? 'Analyzing…' : 'Run risk analysis'}
          </motion.button>
        </div>
      </div>

      <ResultPanel result={result} loading={loading} error={error} />
    </section>
  );
}

