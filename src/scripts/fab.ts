/** Floating contact button: toggles the WhatsApp / Call options. */
export function initFab() {
  const root = document.querySelector<HTMLElement>('[data-fab]');
  const toggle = root?.querySelector<HTMLButtonElement>('[data-fab-toggle]');
  if (!root || !toggle) return;
  const items = [...root.querySelectorAll<HTMLAnchorElement>('[data-fab-item]')];

  const set = (open: boolean, focusMain = false) => {
    root.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', (open ? toggle.dataset.labelClose : toggle.dataset.labelOpen) ?? '');
    items.forEach((a) => (a.tabIndex = open ? 0 : -1));
    if (focusMain) toggle.focus();
  };

  toggle.addEventListener('click', () => set(!root.classList.contains('is-open')));
  items.forEach((a) => a.addEventListener('click', () => setTimeout(() => set(false), 300)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && root.classList.contains('is-open')) set(false, true);
  });
  document.addEventListener('pointerdown', (e) => {
    if (root.classList.contains('is-open') && !root.contains(e.target as Node)) set(false);
  });
}
