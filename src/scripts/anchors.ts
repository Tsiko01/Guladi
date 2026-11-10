/**
 * Sections below the fold use `content-visibility: auto` (faster first load).
 * Their height is only estimated until they render, so before the browser
 * follows an in-page link we switch them to full rendering (`html.cv-off`)
 * — the jump then lands exactly on the section.
 */
export function initAnchors() {
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.hash.length < 2) return;
      document.documentElement.classList.add('cv-off');
    },
    { capture: true },
  );
  addEventListener('hashchange', () => document.documentElement.classList.add('cv-off'));
}
