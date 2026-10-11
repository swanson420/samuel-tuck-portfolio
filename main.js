document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header background once scrolled
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile nav
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const setNav = (open) => {
    navToggle.classList.toggle('open', open);
    navMenu.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setNav(!navMenu.classList.contains('open')));
  navMenu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setNav(false)));

  // Terminal: retype the static transcript with colour
  const term = document.getElementById('termBody');
  if (term) {
    const lines = term.textContent.split('\n');
    const paint = (line) => {
      const esc = line.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      if (esc.startsWith('$')) return '<span class="cmd">' + esc + '</span>';
      return esc
        .replace(/✓/g, '<span class="ok">✓</span>')
        .replace(/→/g, '<span class="arrow">→</span>')
        .replace(/\bFAIL\b/, '<span class="bad">FAIL</span>')
        .replace(/0 fail/, '<span class="ok">0 fail</span>');
    };
    if (reduceMotion) {
      term.innerHTML = lines.map(paint).join('\n');
    } else {
      let i = 0;
      const out = [];
      const tick = () => {
        if (i >= lines.length) {
          term.innerHTML = out.join('\n') + ' <span class="caret"></span>';
          return;
        }
        out.push(paint(lines[i]));
        term.innerHTML = out.join('\n') + '<span class="caret"></span>';
        const isCmd = lines[i].startsWith('$');
        i += 1;
        setTimeout(tick, isCmd ? 650 : lines[i - 1] === '' ? 350 : 170);
      };
      term.innerHTML = '<span class="caret"></span>';
      setTimeout(tick, 500);
    }
  }

  // Count-up stats
  const countUp = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) return;
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Reveal-on-scroll + stats + pipeline lighting
  const revealTargets = document.querySelectorAll('.feature, .card, .step, .timeline li, .stat, .motto, .gl-layer, .track');
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    revealTargets.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('in');
      const num = el.querySelector('[data-count]');
      if (num) countUp(num);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  revealTargets.forEach((el) => io.observe(el));

  const pipeline = document.querySelector('.pipeline');
  if (pipeline && !reduceMotion) {
    const steps = pipeline.querySelectorAll('li');
    let timer = null;
    const run = () => {
      let k = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        steps.forEach((s, idx) => s.classList.toggle('lit', idx === k % steps.length));
        k += 1;
      }, 900);
    };
    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) run();
        else { clearInterval(timer); steps.forEach((s) => s.classList.remove('lit')); }
      });
    }, { threshold: 0.3 }).observe(pipeline);
  }
});
