/**
 * Diapositiva 5 (#slide4): flujo de pago Offline → Bluetooth → Relay → Open Payments → Liquidado.
 * Intro a pantalla completa ("The magic of the frictionless payments has a name: Bluetooth."); con → queda solo
 * "Bluetooth." arriba, entra el proceso y un token lo recorre paso a paso (→ / ←).
 */
(function() {
  const slide = document.getElementById('slide4');
  if (!slide) return;
  const viewport = slide.querySelector('.s4-viewport');
  const packet = document.getElementById('s4Packet');
  const packetLabel = document.getElementById('s4PacketLabel');
  const flowNum = document.getElementById('s4FlowNum');
  const flowText = document.getElementById('s4FlowText');
  const total = 5;
  let step = 0;
  let intro = false;
  let lastKey = '';
  let moveAnim = null;

  const captions = [
    'No signal: the buyer\'s wallet signs a $25,000 payment token offline.',
    'The token jumps over Bluetooth LE to the merchant\'s phone — no data, no roaming.',
    'The merchant\'s phone relays it as an ILP packet over its own 5G connection.',
    'Open Payments, the Account Servicing Entity, authorizes it over Interledger.',
    'Interbank settles it and both phones confirm the payment in seconds.'
  ];
  const labels = ['$25.000 · Token', '$25.000 · Token', 'ILP Packet', 'ILP Packet', 'Settled'];

  // Puntos del recorrido: centro de cada elemento relativo al viewport de la diapositiva
  const anchors = {
    offline: '.s4-phone.offline .s4-phone-screen-icon',
    orb: '.s4-bt-orb',
    online: '.s4-phone.online .s4-phone-screen-icon',
    tunnel: '.s4-op-tunnel',
    cloud: '.s4-op-title',
    conduit: '.s4-conduit-left',
    bank: '.s4-bank-card.primary'
  };
  // Ruta que recorre el token al avanzar a cada paso
  const routes = [
    ['offline'],
    ['offline', 'orb', 'online'],
    ['online', 'tunnel', 'cloud'],
    ['cloud', 'conduit'],
    ['conduit', 'bank']
  ];

  function center(name) {
    const el = slide.querySelector(anchors[name]);
    if (!el || !viewport) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    const v = viewport.getBoundingClientRect();
    return { x: r.left + r.width / 2 - v.left, y: r.top + r.height / 2 - v.top };
  }

  function placeAt(name) {
    const p = center(name);
    packet.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
  }

  function travel(route, duration) {
    if (moveAnim) moveAnim.cancel();
    const frames = route.map(n => {
      const p = center(n);
      return { transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)` };
    });
    placeAt(route[route.length - 1]);
    if (frames.length < 2) return;
    moveAnim = packet.animate(frames, { duration, easing: 'cubic-bezier(.45, 0, .2, 1)' });
  }

  function render(animate) {
    viewport.dataset.flow = String(step);
    flowNum.textContent = String(step + 1).padStart(2, '0');
    flowText.textContent = captions[step];
    packetLabel.textContent = labels[step];
    packet.classList.toggle('done', step === total - 1);

    slide.querySelectorAll('[data-s4-node]').forEach(n => {
      const i = Number(n.dataset.s4Node);
      n.classList.toggle('lit', i <= step);
      n.classList.toggle('current', i === step);
    });
    slide.querySelectorAll('.s4-flow-line[data-s4-line]').forEach(l => {
      l.classList.toggle('lit', Number(l.dataset.s4Line) <= step);
    });

    // Reiniciar la animación del texto del pie
    const cap = slide.querySelector('.s4-flow-caption');
    cap.classList.remove('swap');
    void cap.offsetWidth;
    cap.classList.add('swap');

    const route = routes[step];
    if (animate) travel(route, 600 + route.length * 450);
    else { if (moveAnim) moveAnim.cancel(); placeAt(route[route.length - 1]); }
  }

  function setStep(i, animate) {
    step = Math.max(0, Math.min(total - 1, i));
    render(animate);
  }

  // Intro: la frase aparece palabra por palabra
  function showIntro() {
    intro = true;
    if (moveAnim) moveAnim.cancel();
    packet.classList.remove('show');
    viewport.classList.remove('s4-enter', 's4-from-intro', 's4-bt-flown', 's4-intro-play');
    viewport.classList.add('s4-intro-on');
    void viewport.offsetWidth;
    viewport.classList.add('s4-intro-play');
  }

  // Sale de la intro: "Bluetooth." vuela de la frase al titular y entra el proceso
  function leaveIntro() {
    intro = false;
    const from = slide.querySelector('.s4-intro-bt').getBoundingClientRect();
    viewport.classList.add('s4-bt-flown', 's4-from-intro');
    viewport.classList.remove('s4-intro-on');
    const word = slide.querySelector('.s4-headline span');
    const to = word.getBoundingClientRect();
    const dx = (from.left + from.width / 2) - (to.left + to.width / 2);
    const dy = (from.top + from.height / 2) - (to.top + to.height / 2);
    word.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(${from.height / to.height})` },
      { transform: 'none' }
    ], { duration: 900, easing: 'cubic-bezier(.65, 0, .25, 1)' });
    startProcess(0);
  }

  // Entrada escalonada del proceso; el token aparece cuando ya se pueden medir posiciones reales
  function startProcess(at) {
    viewport.classList.remove('s4-enter');
    void viewport.offsetWidth;
    viewport.classList.add('s4-enter');
    packet.classList.remove('show');
    step = at;
    viewport.dataset.flow = String(step);
    // Esperar a que termine la entrada para medir posiciones reales
    setTimeout(() => {
      if (!slide.classList.contains('active') || intro) return;
      render(false);
      packet.classList.add('show');
    }, 1100);
  }

  // Al llegar avanzando arranca en la intro; volviendo desde la siguiente, en el último paso del proceso
  function enter() {
    const fromBack = lastKey === 'ArrowLeft' || lastKey === 'Backspace' || lastKey === 'PageUp';
    if (fromBack) {
      intro = false;
      viewport.classList.remove('s4-intro-on', 's4-intro-play', 's4-from-intro');
      startProcess(total - 1);
    } else {
      showIntro();
    }
  }

  new MutationObserver(() => {
    if (slide.classList.contains('active')) enter();
    else packet.classList.remove('show');
  }).observe(slide, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('keydown', e => {
    lastKey = e.key;
    if (!slide.classList.contains('active')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      if (intro) {
        e.preventDefault();
        e.stopImmediatePropagation();
        leaveIntro();
      } else if (step < total - 1) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setStep(step + 1, true);
      }
    } else if (e.key === 'ArrowLeft') {
      if (intro) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (step > 0) setStep(step - 1, false);
      else showIntro();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (slide.classList.contains('active') && !intro) placeAt(routes[step][routes[step].length - 1]);
  });

  if (slide.classList.contains('active')) enter();
})();
