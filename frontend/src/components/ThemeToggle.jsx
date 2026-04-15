import { MoonStar, SunMedium } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white/16"
      aria-label="Toggle color mode"
    >
      {isDark ? <SunMedium size={16} /> : <MoonStar size={16} />}
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}

