/**
 * Hero slider: autoplay with progress bars, pause/play, prev/next, dots,
 * swipe and arrow keys. Autoplay holds while keyboard focus is in the slider,
 * the tab is hidden or the hero is scrolled out of view, and
 * is off by default with reduced motion (the play button still works).
 */
const pad = (n: number) => String(n).padStart(2, '0');

function hydrate(slide: HTMLElement) {
  slide.querySelectorAll<HTMLSourceElement>('source[data-srcset]').forEach((s) => {
    s.srcset = s.dataset.srcset!;
    delete s.dataset.srcset;
  });
  const img = slide.querySelector<HTMLImageElement>('img[data-src]');
  if (img) {
    img.src = img.dataset.src!;
    delete img.dataset.src;
  }
}

export function initSlider() {
  const root = document.querySelector<HTMLElement>('[data-slider]');
  if (!root) return;
  const slides = [...root.querySelectorAll<HTMLElement>('[data-slide]')];
  const dots = [...root.querySelectorAll<HTMLButtonElement>('[data-dot]')];
  const count = root.querySelector<HTMLElement>('[data-count]');
  const live = root.querySelector<HTMLElement>('[data-live]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]');
  const n = slides.length;
  if (n < 2) return;

  let index = 0;
  let userPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const holds = new Set<string>();

  const sync = () => {
    root.classList.toggle('is-playing', !userPaused);
    root.classList.toggle('is-paused', userPaused);
    root.classList.toggle('is-held', holds.size > 0);
    if (toggle) {
      toggle.setAttribute('aria-label', (userPaused ? toggle.dataset.labelPlay : toggle.dataset.labelPause) ?? '');
      toggle.setAttribute('aria-pressed', String(userPaused));
    }
  };
  const hold = (key: string, on: boolean) => {
    if (on) holds.add(key);
    else holds.delete(key);
    sync();
  };

  function go(to: number, announce = false) {
    const prev = slides[index];
    index = (to + n) % n;
    hydrate(slides[index]);
    hydrate(slides[(index + 1) % n]);
    slides.forEach((s, i) => {
      const on = i === index;
      s.classList.toggle('is-active', on);
      s.toggleAttribute('inert', !on);
      if (on) s.removeAttribute('aria-hidden');
      else s.setAttribute('aria-hidden', 'true');
    });
    if (prev !== slides[index]) delete prev.dataset.initial;
    dots.forEach((d, i) => (i === index ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current')));
    if (count) count.textContent = pad(index + 1);
    if (announce && live) {
      const title = slides[index].querySelector('.slide__title')?.textContent?.replace(/\s+/g, ' ').trim();
      live.textContent = `${slides[index].getAttribute('aria-label')}: ${title}`;
    }
  }

  // autoplay: the active progress bar's animation ends → next slide
  dots.forEach((d, i) =>
    d.addEventListener('animationend', () => {
      if (i === index && !userPaused) go(index + 1);
    }),
  );
  dots.forEach((d, i) => d.addEventListener('click', () => go(i, true)));
  root.querySelector('[data-prev]')?.addEventListener('click', () => go(index - 1, true));
  root.querySelector('[data-next]')?.addEventListener('click', () => go(index + 1, true));
  toggle?.addEventListener('click', () => {
    userPaused = !userPaused;
    sync();
  });

  // hold while keyboard focus is inside the slider (the hero fills the screen,
  // so pausing on mouse hover would stop it almost always)
  root.addEventListener('focusin', (e) => (e.target as HTMLElement).matches(':focus-visible') && hold('focus', true));
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget as Node)) hold('focus', false);
  });
  document.addEventListener('visibilitychange', () => hold('hidden', document.hidden));
  new IntersectionObserver(([entry]) => hold('offscreen', !entry.isIntersecting), { threshold: 0.25 }).observe(root);

  // keyboard
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') go(index - 1, true);
    else if (e.key === 'ArrowRight') go(index + 1, true);
  });

  // swipe
  let x0 = 0;
  let y0 = 0;
  let tracking = false;
  const track = root.querySelector<HTMLElement>('[data-track]')!;
  track.addEventListener('pointerdown', (e) => {
    tracking = true;
    x0 = e.clientX;
    y0 = e.clientY;
  });
  track.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - x0;
    const dy = e.clientY - y0;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) go(index + (dx < 0 ? 1 : -1), true);
  });
  track.addEventListener('pointercancel', () => (tracking = false));

  // wait for the intro screen before the first progress bar starts
  if (document.documentElement.classList.contains('intro')) {
    hold('intro', true);
    setTimeout(() => hold('intro', false), 1450);
  }
  sync();

  // load the other slides' images once the page itself has finished loading
  const later = () => ('requestIdleCallback' in window ? requestIdleCallback(() => slides.forEach(hydrate), { timeout: 2500 }) : setTimeout(() => slides.forEach(hydrate), 1200));
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
}
