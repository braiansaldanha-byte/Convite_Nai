(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const memories = [
    { src: 'teste.jpeg', alt: 'Papai sorrindo e segurando o teste de gravidez', title: 'A notícia mais linda', copy: 'Um teste, o sorriso do papai e uma vida inteira de amor começando.', caption: 'O dia em que tudo mudou.' },
    { src: 'eco1.jpeg', alt: 'Primeira imagem de ultrassom da Inaiê', title: 'Meu primeiro retratinho', copy: 'Ainda tão pequenininha, mas já ocupando um espaço enorme no coração da família.', caption: 'Pequenininha. E tão amada.' },
    { src: 'barriga.jpeg', alt: 'Barriga da mamãe durante a gestação da Inaiê', title: 'Meu primeiro lar', copy: 'Aqui dentro eu cresço. Aí fora, cresce a vontade de me conhecer. Falta pouco para o nosso abraço.', caption: 'Crescendo junto com esse amor.' }
  ];
  const experience = $('#experience');
  const cover = $('#cover');
  const storageKey = 'inaie-invitation-accepted-v1';
  let current = 0;
  let opening = false;
  let openTimer;
  let accepted = false;
  let confettiFrame = 0;
  let particles = [];
  const status = $('#status');
  const canvas = $('#confetti');
  const context = canvas.getContext('2d');
  const dialog = $('#photo-dialog');
  const validAnchors = ['#story', '#invitation', '#answer'];
  experience.hidden = !validAnchors.includes(location.hash);
  cover.hidden = !experience.hidden;
  try { accepted = localStorage.getItem(storageKey) === 'yes'; } catch { /* Storage is optional. */ }

  function showAcceptance() {
    $('#before-yes').hidden = accepted;
    $('#after-yes').hidden = !accepted;
    $('#answer').setAttribute('aria-labelledby', accepted ? 'success-title' : 'answer-title');
  }
  showAcceptance();
  function goTo(hash, focus = false) {
    experience.hidden = false;
    cover.hidden = true;
    const target = $(hash);
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    if (focus) {
      const heading = target.id === 'answer' && accepted ? $('#success-title') : target.querySelector('h2');
      heading?.setAttribute('tabindex', '-1');
      heading?.focus({ preventScroll: true });
    }
  }
  $('#open-letter').addEventListener('click', (event) => {
    event.preventDefault();
    if (opening) return;
    opening = true;
    cover.classList.add('opening');
    openTimer = window.setTimeout(() => {
      history.replaceState(null, '', '#story');
      goTo('#story', true);
      opening = false;
    }, reducedMotion.matches ? 0 : 650);
  });
  window.addEventListener('hashchange', () => {
    if (validAnchors.includes(location.hash)) goTo(location.hash, true);
  });
  function updateMemory(index) {
    current = Math.max(0, Math.min(index, memories.length - 1));
    const memory = memories[current];
    const photo = $('#memory-photo');
    photo.src = memory.src;
    photo.alt = memory.alt;
    photo.classList.toggle('ultrasound', current === 1);
    photo.classList.remove('changing');
    requestAnimationFrame(() => photo.classList.add('changing'));
    $('#memory-title').textContent = memory.title;
    $('#memory-copy').textContent = memory.copy;
    $('#memory-number').textContent = String(current + 1).padStart(2, '0');
    $('#memory-count').textContent = `0${current + 1} / 03`;
    $('#photo-caption').textContent = memory.caption;
    $('#expand-photo').setAttribute('aria-label', `Ampliar foto: ${memory.title}`);
    $('#previous-memory').disabled = current === 0;
    $('#next-memory').disabled = current === memories.length - 1;
    document.querySelectorAll('[data-memory]').forEach((button, index) => {
      button.classList.toggle('selected', index === current);
      button.setAttribute('aria-pressed', String(index === current));
    });
  }
  $('#previous-memory').addEventListener('click', () => updateMemory(current - 1));
  $('#next-memory').addEventListener('click', () => updateMemory(current + 1));
  document.querySelectorAll('[data-memory]').forEach(button => button.addEventListener('click', () => updateMemory(Number(button.dataset.memory))));
  $('.album').addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      updateMemory(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart;
  let swiped = false;
  $('.photo-button').addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStart = { x: touch.clientX, y: touch.clientY };
    swiped = false;
  }, { passive: true });
  $('.photo-button').addEventListener('touchend', event => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      swiped = true;
      updateMemory(current + (dx < 0 ? 1 : -1));
    }
    touchStart = null;
  }, { passive: true });
  $('#expand-photo').addEventListener('click', () => {
    if (swiped) { swiped = false; return; }
    const memory = memories[current];
    dialog.querySelector('img').src = memory.src;
    dialog.querySelector('img').alt = memory.alt;
    dialog.querySelector('p').textContent = memory.caption;
    dialog.showModal();
  });
  $('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  function clearConfetti() {
    cancelAnimationFrame(confettiFrame);
    confettiFrame = 0;
    particles = [];
    if (context) context.clearRect(0, 0, canvas.width, canvas.height);
  }
  function celebrate() {
    if (!context || reducedMotion.matches) return;
    clearConfetti();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ['#a95e6c', '#d4a58c', '#a5ac8b', '#e7b8be', '#ba9461'];
    particles = Array.from({ length: 100 }, () => ({
      x: canvas.width / 2, y: canvas.height * .42,
      vx: (Math.random() - .5) * 12, vy: -5 - Math.random() * 9,
      size: 3 + Math.random() * 5, rotation: Math.random() * Math.PI,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    const start = performance.now();
    let previous = start;
    function frame(time) {
      const elapsed = time - start;
      const delta = Math.min((time - previous) / 16.67, 2);
      previous = time;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (elapsed > 3000) { clearConfetti(); return; }
      for (const p of particles) {
        p.vy += .14 * delta; p.x += p.vx * delta; p.y += p.vy * delta; p.rotation += .04 * delta;
        context.save(); context.translate(p.x, p.y); context.rotate(p.rotation);
        context.globalAlpha = Math.max(0, 1 - elapsed / 3000); context.fillStyle = p.color;
        context.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .55); context.restore();
      }
      confettiFrame = requestAnimationFrame(frame);
    }
    confettiFrame = requestAnimationFrame(frame);
  }
  reducedMotion.addEventListener('change', clearConfetti);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearConfetti(); });
  $('#accept').addEventListener('click', () => {
    accepted = true;
    showAcceptance();
    try { localStorage.setItem(storageKey, 'yes'); }
    catch { status.textContent = 'Seu “sim” foi celebrado! Este navegador não permite guardá-lo entre visitas.'; }
    $('#success-title').focus({ preventScroll: true });
    celebrate();
  });
  $('#celebrate').addEventListener('click', () => {
    celebrate();
    status.textContent = reducedMotion.matches ? 'Mais um coração cheio de alegria por aqui! ♡' : 'Viva esse novo laço! ♡';
  });
  $('#share').addEventListener('click', async () => {
    const text = 'Inaiê, eu aceito! ♡ Com todo o meu coração, quero fazer parte da sua vida. Que venha uma história linda de amor, colo e carinho!';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meu sim para a Inaiê ♡', text });
        status.textContent = 'Seu “sim” está pronto para fazer os papais sorrirem.';
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        status.textContent = 'Mensagem copiada! Cole na conversa com os papais.';
      } else { status.textContent = `Copie e envie aos papais: ${text}`; }
    } catch (error) {
      if (error.name !== 'AbortError') status.textContent = `Não foi possível compartilhar. Copie e envie: ${text}`;
    }
  });
  $('#download').addEventListener('click', () => {
    const card = document.createElement('canvas');
    card.width = 1200; card.height = 1600;
    const ctx = card.getContext('2d');
    if (!ctx) { status.textContent = 'Não foi possível criar a lembrança neste navegador.'; return; }
    ctx.fillStyle = '#f7f2ec'; ctx.fillRect(0, 0, 1200, 1600);
    ctx.strokeStyle = '#d1b3a7'; ctx.lineWidth = 2;
    ctx.strokeRect(65, 65, 1070, 1470); ctx.strokeRect(80, 80, 1040, 1440);
    ctx.textAlign = 'center'; ctx.fillStyle = '#99525f';
    ctx.font = '24px Georgia'; ctx.fillText('UM LAÇO PARA A VIDA TODA', 600, 230);
    ctx.font = '90px Georgia'; ctx.fillText('♡', 600, 390);
    ctx.fillStyle = '#493d3c'; ctx.font = '58px Georgia'; ctx.fillText('Eu disse sim', 600, 550);
    ctx.font = 'italic 125px Georgia'; ctx.fillStyle = '#99525f'; ctx.fillText('à Inaiê.', 600, 710);
    ctx.fillStyle = '#796a66'; ctx.font = '32px Georgia';
    ['Para ser abraço, conselho e colo.', 'Para caminhar junto.', 'Para amar em todos os capítulos.'].forEach((line, i) => ctx.fillText(line, 600, 870 + i * 58));
    ctx.strokeStyle = '#d1b3a7'; ctx.beginPath(); ctx.moveTo(440, 1125); ctx.lineTo(760, 1125); ctx.stroke();
    ctx.font = 'italic 38px Georgia'; ctx.fillStyle = '#99525f'; ctx.fillText('Tem um lugar no meu coração', 600, 1240); ctx.fillText('que já é seu.', 600, 1290);
    ctx.font = '22px Georgia'; ctx.fillStyle = '#796a66'; ctx.fillText('Com amor, Inaiê e os papais', 600, 1415);
    card.toBlob(blob => {
      if (!blob) { status.textContent = 'Não foi possível criar a lembrança. Tente novamente.'; return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'Meu-sim-para-Inaie.png';
      document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      status.textContent = 'Sua lembrança está pronta! Confira os downloads do navegador.';
    }, 'image/png');
  });
  $('#restart').addEventListener('click', () => {
    clearTimeout(openTimer); clearConfetti(); opening = false;
    experience.hidden = true; cover.hidden = false; cover.classList.remove('opening');
    history.replaceState(null, '', location.pathname + location.search);
    updateMemory(0); window.scrollTo({ top: 0, behavior: 'instant' });
    $('#open-letter').focus({ preventScroll: true });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) document.querySelectorAll('.chapter-nav a').forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-10% 0px -55% 0px', threshold: 0 });
    document.querySelectorAll('.section').forEach(section => observer.observe(section));
  }
})();
