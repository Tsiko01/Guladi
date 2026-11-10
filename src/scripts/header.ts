/** Header: shadow once scrolled, mobile menu, and highlighting the section in view. */
export function initHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;

  // shadow after scrolling
  // (first read waits a frame so it never forces a layout during start-up)
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  requestAnimationFrame(onScroll);
  addEventListener('scroll', onScroll, { passive: true });

  // mobile menu
  const btn = header.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLElement>('[data-menu]');
  if (btn && menu) {
    const labelOpen = btn.querySelector<HTMLElement>('[data-label-open]');
    const labelClose = btn.querySelector<HTMLElement>('[data-label-close]');
    const set = (open: boolean) => {
      btn.setAttribute('aria-expanded', String(open));
      menu.hidden = !open;
      menu.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('menu-open', open);
      if (labelOpen) labelOpen.hidden = open;
      if (labelClose) labelClose.hidden = !open;
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) {
        set(false);
        btn.focus();
      }
    });
    matchMedia('(min-width: 1180px)').addEventListener('change', (e) => e.matches && set(false));
  }

  // scroll-spy: mark the nav link of the section currently in view
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav]')];
  const sections = [...new Set(links.map((a) => a.dataset.nav!))]
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  if (!sections.length) return;
  const visible = new Map<string, number>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = '';
      let max = 0;
      visible.forEach((r, id) => {
        if (r > max) {
          max = r;
          best = id;
        }
      });
      links.forEach((a) => (a.dataset.nav === best ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    },
    { rootMargin: '-35% 0px -50% 0px', threshold: [0, 0.01, 0.25, 0.5, 1] },
  );
  sections.forEach((s) => io.observe(s));
}
