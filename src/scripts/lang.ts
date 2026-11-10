/**
 * Remembers the language picked in the GE / EN switch. The redirect for a
 * returning visitor happens before first paint in Base.astro's inline script.
 */
export function initLang() {
  document.querySelectorAll<HTMLAnchorElement>('[data-lang-link]').forEach((a) =>
    a.addEventListener('click', () => {
      try {
        localStorage.setItem('guladi-lang', a.dataset.langLink!);
      } catch {}
    }),
  );
}
