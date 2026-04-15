import { ShieldCheck, GitBranch, Radar } from 'lucide-react';

import ThemeToggle from './ThemeToggle.jsx';

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-400/20 text-teal-200">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-teal-200/75">Project 2030</p>
            <div className="flex items-center gap-2 text-white">
              <span className="text-lg font-semibold">ScamShield Malaysia</span>
              <Radar size={16} className="text-orange-300" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Rohan5commit/scamshield-malaysia"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/12 md:inline-flex"
          >
            <GitBranch size={16} />
            Public GitHub
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
