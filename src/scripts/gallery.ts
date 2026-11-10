/** Gallery filters, "show more" and the photo lightbox. */
export function initGallery() {
  const lb = document.querySelector<HTMLDialogElement>('[data-lightbox]');
  document.querySelectorAll<HTMLElement>('[data-gallery-root]').forEach((root) => setup(root, lb));
}

function setup(root: HTMLElement, lb: HTMLDialogElement | null) {
  const tiles = [...root.querySelectorAll<HTMLLIElement>('.tile')];
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const more = root.querySelector<HTMLButtonElement>('[data-more]');
  let filter = 'all';
  let expanded = false;

  const show = (animate: boolean) => {
    let n = 0;
    tiles.forEach((t) => {
      const match = filter === 'all' ? expanded || !t.hasAttribute('data-extra') : t.dataset.cat === filter;
      const was = !t.hidden;
      t.hidden = !match;
      t.classList.remove('is-in');
      if (match && animate && (!was || filter !== 'all')) {
        t.style.setProperty('--d', `${Math.min(n, 10) * 40}ms`);
        void t.offsetWidth;
        t.classList.add('is-in');
      }
      if (match) n++;
    });
    if (more) more.parentElement!.hidden = filter !== 'all' || expanded;
  };

  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      filter = chip.dataset.filter!;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      show(true);
    }),
  );
  more?.addEventListener('click', () => {
    expanded = true;
    show(true);
    // move focus to the first newly shown photo
    root.querySelector<HTMLButtonElement>('.tile[data-extra]:not([hidden]) .tile__btn')?.focus({ preventScroll: true });
  });

  if (!lb) return;
  const img = lb.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const cap = lb.querySelector<HTMLElement>('[data-lb-cap]')!;
  const label = lb.querySelector<HTMLElement>('[data-lb-label]')!;
  const count = lb.querySelector<HTMLElement>('[data-lb-count]')!;
  let list: HTMLButtonElement[] = [];
  let i = 0;
  let opener: HTMLButtonElement | null = null;

  const render = () => {
    const b = list[i];
    img.classList.add('is-loading');
    img.onload = () => img.classList.remove('is-loading');
    img.sizes = '(min-width: 1400px) 1400px, 100vw';
    img.srcset = b.dataset.full!;
    img.src = b.dataset.fullSrc!;
    img.alt = b.dataset.alt!;
    cap.textContent = b.dataset.alt!;
    label.textContent = b.dataset.label!;
    count.textContent = `${i + 1} / ${list.length}`;
  };
  const step = (d: number) => {
    i = (i + d + list.length) % list.length;
    render();
  };

  root.querySelectorAll<HTMLButtonElement>('.tile__btn').forEach((btn) =>
    btn.addEventListener('click', () => {
      list = tiles.filter((t) => !t.hidden).map((t) => t.querySelector<HTMLButtonElement>('.tile__btn')!);
      i = list.indexOf(btn);
      opener = btn;
      render();
      lb.showModal();
      document.documentElement.style.overflow = 'hidden';
    }),
  );

  if (lb.dataset.bound) return;
  lb.dataset.bound = '1';
  lb.querySelector('[data-lb-close]')!.addEventListener('click', () => lb.close());
  lb.querySelector('[data-lb-prev]')!.addEventListener('click', () => step(-1));
  lb.querySelector('[data-lb-next]')!.addEventListener('click', () => step(1));
  lb.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus({ preventScroll: true });
  });
  // click on the backdrop (outside the photo) closes — but not right after a swipe
  let x0 = 0;
  let swiped = false;
  lb.addEventListener('click', (e) => {
    if (swiped) return void (swiped = false);
    if (e.target === lb || (e.target as HTMLElement).classList.contains('lb__figure')) lb.close();
  });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });
  lb.addEventListener('pointerdown', (e) => {
    x0 = e.clientX;
    swiped = false;
  });
  lb.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) {
      swiped = true;
      step(dx < 0 ? 1 : -1);
    }
  });
}
