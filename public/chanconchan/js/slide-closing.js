/**
 * Diapositiva 6 (#slide7): gran cierre.
 * Fondo: el globo holográfico de la diapositiva 3, ahora con las ciudades interconectadas.
 * Pasos (→ / ←): 0 título · 1 cita parte 1 · 2 cita parte 2 (+ Medellín conectado con el mundo).
 */
(function() {
  const slide = document.getElementById('slide7');
  if (!slide) return;
  const hero = slide.querySelector('.s7-hero-center');
  const quotes = slide.querySelectorAll('.s7-quote');
  const globeBg = slide.querySelector('.s7-globe-bg');
  const total = 3;
  const MDE = { name: 'Medellín', lat: 6.2442, lng: -75.5812 };
  let step = 0;
  let lastKey = '';
  let globe = null;

  // Partir cada cita en palabras (conservando <em>/<strong>) para revelarlas una a una
  quotes.forEach(q => {
    let i = 0;
    const wrap = node => {
      Array.from(node.childNodes).forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement('span');
            span.className = 's7-word';
            span.style.setProperty('--i', i++);
            span.textContent = part;
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    wrap(q);
  });

  // ---------- Globo con red de ciudades ----------
  function cities() {
    // worldCitiesData vive en js/deck.js (diapositiva 3)
    const list = typeof worldCitiesData !== 'undefined' ? worldCitiesData : [];
    return [MDE].concat(list);
  }

  function distance(a, b) {
    const r = Math.PI / 180;
    const s = Math.sin((b.lat - a.lat) * r / 2) ** 2 +
      Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2;
    return 2 * Math.asin(Math.sqrt(s));
  }

  // Malla: cada ciudad con sus 2 vecinas más cercanas + algunas rutas intercontinentales
  function meshArcs(list) {
    const seen = new Set();
    const arcs = [];
    const add = (a, b, color) => {
      const key = [a.name, b.name].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      arcs.push({ startLat: a.lat, startLng: a.lng, endLat: b.lat, endLng: b.lng, color });
    };
    list.forEach(a => {
      list.filter(b => b !== a)
        .sort((x, y) => distance(a, x) - distance(a, y))
        .slice(0, 2)
        .forEach(b => add(a, b, ['rgba(255, 201, 56, 0.85)', 'rgba(52, 199, 123, 0.85)']));
    });
    const hubs = ['New York', 'London', 'Lagos', 'Mumbai', 'Singapore', 'Tokyo', 'São Paulo', 'Sydney', 'Dubai'];
    hubs.forEach((h, i) => {
      const a = list.find(c => c.name === h);
      const b = list.find(c => c.name === hubs[(i + 3) % hubs.length]);
      if (a && b) add(a, b, ['rgba(255, 201, 56, 0.7)', 'rgba(255, 201, 56, 0.7)']);
    });
    return arcs;
  }

  // Paso final: Medellín (el puente) conectado con todos los continentes
  function bridgeArcs(list) {
    const targets = ['Mexico City', 'New York', 'São Paulo', 'Buenos Aires', 'Madrid', 'London', 'Lagos',
      'Nairobi', 'Cairo', 'Dubai', 'Mumbai', 'Singapore', 'Shanghai', 'Tokyo', 'Sydney', 'Jakarta', 'Lima'];
    return targets.map(n => list.find(c => c.name === n)).filter(Boolean).map(b => ({
      startLat: MDE.lat, startLng: MDE.lng, endLat: b.lat, endLng: b.lng,
      color: ['rgba(49, 189, 112, 0.95)', 'rgba(255, 201, 56, 0.95)'], bridge: true
    }));
  }

  function altitudeFor() {
    const h = window.innerHeight;
    const radiusPx = h * 0.62;
    const t = Math.tan(25 * Math.PI / 180);
    return Math.sqrt(1 + Math.pow((h / 2) / (radiusPx * t), 2)) - 1;
  }

  let mesh = [];
  let bridge = [];

  function updateArcs() {
    if (!globe) return;
    globe.arcsData(step === total - 1 ? mesh.concat(bridge) : mesh);
  }

  function initGlobe() {
    const el = document.getElementById('s7Globe');
    if (!el || typeof Globe === 'undefined') return;
    const list = cities();
    mesh = meshArcs(list);
    bridge = bridgeArcs(list);
    const countries = ((window.WORLD_COUNTRIES || {}).features || []).map(f => ({ ...f, isCol: f.properties.iso === 'COL' }));

    globe = Globe()(el)
      .width(window.innerWidth)
      .height(window.innerHeight)
      .backgroundColor('rgba(0,0,0,0)')
      .showAtmosphere(true)
      .atmosphereColor('#34c77b')
      .atmosphereAltitude(0.18)
      .showGraticules(true)
      .polygonsData(countries)
      .polygonCapColor(d => d.isCol ? 'rgba(52, 199, 123, 0.45)' : 'rgba(52, 199, 123, 0.04)')
      .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
      .polygonStrokeColor(d => d.isCol ? '#34c77b' : 'rgba(140, 230, 180, 0.45)')
      .polygonAltitude(d => d.isCol ? 0.006 : 0.004)
      .htmlElementsData(list)
      .htmlLat(d => d.lat)
      .htmlLng(d => d.lng)
      .htmlAltitude(0.006)
      .htmlElement(d => {
        const dot = document.createElement('div');
        dot.className = d === MDE ? 's7-city-dot s7-city-dot--mde' : 's7-city-dot';
        return dot;
      })
      .arcColor('color')
      .arcAltitude(d => d.bridge ? 0.2 : null)
      .arcAltitudeAutoScale(0.3)
      .arcStroke(d => d.bridge ? 0.55 : 0.32)
      .arcDashLength(0.45)
      .arcDashGap(0.25)
      .arcDashInitialGap(() => Math.random())
      .arcDashAnimateTime(d => d.bridge ? 1800 : 3200)
      .ringsData([MDE])
      .ringLat(d => d.lat)
      .ringLng(d => d.lng)
      .ringColor(() => t => `rgba(255, 201, 56, ${1 - t})`)
      .ringMaxRadius(7)
      .ringPropagationSpeed(2.6)
      .ringRepeatPeriod(1100);

    const mat = globe.globeMaterial();
    if (mat) {
      mat.color.set('#0b2418');
      mat.transparent = true;
      mat.opacity = 0.9;
      mat.roughness = 0.8;
    }
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = -0.25;
      controls.enableZoom = false;
    }
    globe.pointOfView({ lat: 18, lng: -40, altitude: altitudeFor() }, 0);
    updateArcs();
    requestAnimationFrame(() => globeBg.classList.add('ready'));
  }

  // ---------- Pasos ----------
  function render() {
    hero.dataset.s7Step = String(step);
    quotes[0].classList.toggle('shown', step >= 1);
    quotes[1].classList.toggle('shown', step >= 2);
    updateArcs();
  }

  function enter() {
    const fromBack = lastKey === 'ArrowLeft' || lastKey === 'Backspace' || lastKey === 'PageUp';
    step = fromBack ? total - 1 : 0;
    render();
    if (!globe) setTimeout(initGlobe, 60);
    else globe.resumeAnimation();
  }

  new MutationObserver(() => {
    if (slide.classList.contains('active')) enter();
    else if (globe) globe.pauseAnimation();
  }).observe(slide, { attributes: true, attributeFilter: ['class'] });

  document.addEventListener('keydown', e => {
    lastKey = e.key;
    if (!slide.classList.contains('active')) return;
    if ((e.key === 'ArrowRight' || e.key === ' ') && step < total - 1) {
      e.preventDefault();
      e.stopImmediatePropagation();
      step++;
      render();
    } else if (e.key === 'ArrowLeft' && step > 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
      step--;
      render();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (!globe) return;
    globe.width(window.innerWidth).height(window.innerHeight);
    globe.pointOfView({ altitude: altitudeFor() }, 0);
  });
})();
