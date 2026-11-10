/**
 * Light / dark theme. The initial theme (saved choice, otherwise the system
 * preference) is applied before first paint by the inline script in Base.astro.
 */
const KEY = 'guladi-theme';
const THEME_COLOR = { light: '#f6f4f1', dark: '#0a0b0d' } as const;

const current = () => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function sync() {
  const dark = current() === 'dark';
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-pressed', String(dark)));
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[current()]);
}

function apply(next: 'light' | 'dark', from?: HTMLElement) {
  const root = document.documentElement;
  const set = () => {
    root.dataset.theme = next;
    sync();
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return set();
  if (document.startViewTransition && from) {
    // circular reveal from the button
    const r = from.getBoundingClientRect();
    root.style.setProperty('--tx', `${r.left + r.width / 2}px`);
    root.style.setProperty('--ty', `${r.top + r.height / 2}px`);
    root.dataset.themeSwitching = '';
    document.startViewTransition(set).finished.finally(() => delete root.dataset.themeSwitching);
    return;
  }
  root.classList.add('theme-fade');
  set();
  setTimeout(() => root.classList.remove('theme-fade'), 500);
}

export function initTheme() {
  sync();
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(KEY, next);
      } catch {}
      apply(next, btn);
    }),
  );
  // follow the system setting until the visitor picks a theme
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {}
    if (!saved) apply(e.matches ? 'dark' : 'light');
  });
}
