import { motion } from 'framer-motion';

import { riskTone } from '../lib/helpers.js';

export default function RiskGauge({ score = 0 }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (Math.min(score, 100) / 100) * circumference;
  const tone = riskTone(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="170" height="170" viewBox="0 0 170 170" className="-rotate-90">
        <circle cx="85" cy="85" r={radius} className="risk-ring-track" strokeWidth="14" fill="transparent" />
        <motion.circle
          cx="85"
          cy="85"
          r={radius}
          stroke={tone.accent}
          strokeWidth="14"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-4xl font-semibold text-[color:var(--text-strong)]">{score}</span>
        <span className="mt-1 text-xs font-medium uppercase tracking-[0.25em] text-[color:var(--text-muted)]">{tone.label}</span>
      </div>
    </div>
  );
}

