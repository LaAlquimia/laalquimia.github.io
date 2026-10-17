/**
 * Wireless Payments — Interactive Deck Controller
 */

// Diapositivas con revelado paso a paso: cada → enciende el siguiente [data-step] antes de cambiar de diapositiva
const stepEnter = {};
function stepSlide(id, last, onApply) {
          let step = 0;

          function setStep(idx) {
            const slide = document.getElementById(id);
            if (!slide) return;
            step = Math.max(0, Math.min(last, idx));
            slide.querySelectorAll('[data-step]').forEach(item => {
              item.classList.toggle('on', Number(item.dataset.step) <= step);
            });
            if (onApply) onApply(slide, step);
          }

          // Al entrar avanzando arranca desde el principio; al volver desde la siguiente, en el último paso
          stepEnter[id] = fromForward => setStep(fromForward ? 0 : last);

          document.addEventListener('keydown', function(e) {
            const slide = document.getElementById(id);
            if (!slide || !slide.classList.contains('active')) return;
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
              if (step < last) {
                e.preventDefault();
                e.stopImmediatePropagation();
                setStep(step + 1);
              }
            } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
              if (step > 0) {
                e.preventDefault();
                e.stopImmediatePropagation();
                setStep(step - 1);
              }
            }
          }, true);

          return setStep;
        }

// Diapositiva 1: Without signal → You don't exist → 3.4 billion people can't pay → transport → food → medicine
const setS1Step = stepSlide('slide1', 5);
setS1Step(0);

// Diapositiva 3: 3.45B → "Cut off at the last mile." → Server → ISP → Cell tower → User → última milla → Merchant
stepSlide('slide3', 7);

// Equipo: presentación → las tarjetas se voltean y muestran el QR de LinkedIn
stepSlide('slide-team', 1);

// Diapositiva 2: "You have money..." → 3 numerales uno a uno → se retiran y aparece "Time is wasted."
const setS2Step = stepSlide('slide2', 4, (slide, step) => {
          slide.classList.toggle('s2-finale-on', step === 4);
        });

// Diapositiva 4 (#slide5): SOM → SAM → TAM — mapa con cámara (Medellín → Colombia → Mundo) + info paso a paso
(function() {
          let s5Step = 0;
          const totalS5 = 9;
          const stageOf = step => Math.floor(step / 3); // 0 SOM · 1 SAM · 2 TAM
          const SVG_NS = 'http://www.w3.org/2000/svg';
          const MDE = { lat: 6.2442, lng: -75.5812 };
          const kickerTexts = [
            'What we earn as a pilot · Medellín',
            'What we earn as a company · Colombia & Region',
            'Money lost today · World'
          ];

          // Ciudades de Colombia (SOM: con etiqueta; SAM: anillos de ingresos)
          const colCities = [
            { name: 'Bogotá', lat: 4.711, lng: -74.0721, bank: true },
            { name: 'Cali', lat: 3.4516, lng: -76.532, bank: true },
            { name: 'Barranquilla', lat: 10.9639, lng: -74.7964, bank: true },
            { name: 'Cartagena', lat: 10.391, lng: -75.4794 },
            { name: 'Bucaramanga', lat: 7.1193, lng: -73.1227, bank: true },
            { name: 'Pereira', lat: 4.8133, lng: -75.6961 }
          ];
          // Región (SAM): LatAm + turistas sin roaming
          const regionCities = [
            { name: 'Panamá', lat: 8.98, lng: -79.52 }, { name: 'San José', lat: 9.93, lng: -84.08 },
            { name: 'Guatemala', lat: 14.63, lng: -90.51 }, { name: 'Caracas', lat: 10.48, lng: -66.9 },
            { name: 'Quito', lat: -0.18, lng: -78.47 },
            { name: 'Santo Domingo', lat: 18.49, lng: -69.93 }, { name: 'Miami', lat: 25.76, lng: -80.19 },
            { name: 'Manaus', lat: -3.12, lng: -60.02 }
          ];
          // Mundo (TAM): hubs con población fuera de línea en el punto de pago
          const worldHubs = [
            { lat: 19.43, lng: -99.13 }, { lat: 40.71, lng: -74.01 }, { lat: -23.55, lng: -46.63 },
            { lat: -34.6, lng: -58.38 }, { lat: -12.05, lng: -77.04 }, { lat: 34.05, lng: -118.24 },
            { lat: 51.51, lng: -0.13 }, { lat: 40.42, lng: -3.7 }, { lat: 48.86, lng: 2.35 },
            { lat: 41.01, lng: 28.98 }, { lat: 55.76, lng: 37.62 }, { lat: 6.52, lng: 3.38 },
            { lat: 30.04, lng: 31.24 }, { lat: -1.29, lng: 36.82 }, { lat: -26.2, lng: 28.05 },
            { lat: 14.72, lng: -17.47 }, { lat: -4.44, lng: 15.27 }, { lat: 9.03, lng: 38.74 },
            { lat: 25.2, lng: 55.27 }, { lat: 19.08, lng: 72.88 }, { lat: 28.61, lng: 77.21 },
            { lat: 23.81, lng: 90.41 }, { lat: 39.9, lng: 116.41 }, { lat: 31.23, lng: 121.47 },
            { lat: 35.68, lng: 139.69 }, { lat: 1.35, lng: 103.82 }, { lat: -6.2, lng: 106.85 },
            { lat: 14.6, lng: 120.98 }, { lat: 13.76, lng: 100.5 }, { lat: -33.87, lng: 151.21 },
            { lat: 24.86, lng: 67.0 }, { lat: 33.69, lng: 73.05 }
          ];
          // Área Metropolitana del Valle de Aburrá: cabeceras municipales (etiqueta a la izquierda si anchor = 'end')
          const metroTowns = [
            { name: 'Bello', lat: 6.3373, lng: -75.5579 },
            { name: 'Copacabana', lat: 6.3487, lng: -75.5091 },
            { name: 'Girardota', lat: 6.3772, lng: -75.4459 },
            { name: 'Barbosa', lat: 6.4386, lng: -75.333 },
            { name: 'Envigado', lat: 6.17, lng: -75.587 },
            { name: 'Itagüí', lat: 6.1719, lng: -75.6114, anchor: 'end' },
            { name: 'Sabaneta', lat: 6.1515, lng: -75.6166, dy: 16 },
            { name: 'La Estrella', lat: 6.1577, lng: -75.643, anchor: 'end' },
            { name: 'Caldas', lat: 6.0911, lng: -75.6357 }
          ];
          // Eje del valle (Río Medellín), estilizado de sur a norte
          const riverPts = [
            [-75.637, 6.07], [-75.628, 6.12], [-75.607, 6.165], [-75.592, 6.2], [-75.576, 6.25],
            [-75.566, 6.3], [-75.545, 6.335], [-75.508, 6.352], [-75.45, 6.375], [-75.39, 6.41], [-75.33, 6.445]
          ];
          // Fase 0: campus y escenarios de eventos donde arranca el piloto
          const pilotSites = [
            { lat: 6.2672, lng: -75.5688 }, { lat: 6.2005, lng: -75.5782 }, { lat: 6.2433, lng: -75.5898 },
            { lat: 6.2617, lng: -75.5772 }, { lat: 6.2316, lng: -75.6105 }, { lat: 6.2433, lng: -75.5762 },
            { lat: 6.2569, lng: -75.5903 }
          ];

          // Cámaras por nivel: centro geográfico, punto de pantalla donde cae y escala (px por grado)
          function cameraFor(stage) {
            const w = window.innerWidth, h = window.innerHeight;
            if (stage === 0) return { lng: -75.495, lat: 6.235, sx: 0.25, sy: 0.49, k: h / 0.64 };
            if (stage === 1) return { lng: -76.5, lat: 6.5, sx: 0.27, sy: 0.5, k: h / 44 };
            return { lng: -25, lat: 18, sx: 0.31, sy: 0.5, k: Math.min(w / 290, h / 150) };
          }

          // Cámara de llegada desde el globo de la diapositiva 3 (Colombia completa, Medellín al centro)
          function arrivalCam() {
            return { lng: MDE.lng, lat: MDE.lat, sx: 0.25, sy: 0.5, k: window.innerHeight / 10.5 };
          }

          const merc = lat => {
            const l = Math.max(-82, Math.min(84, lat));
            return Math.log(Math.tan(Math.PI / 4 + l * Math.PI / 360)) * 180 / Math.PI;
          };

          let svg = null, camGroup = null, fineGrid = null, muniCam = null, metroLayer = null;
          let leavingS5 = false;
          let items = [];        // elementos superpuestos que se reposicionan en cada cuadro
          let cam = null;        // cámara actual
          let anim = null;
          let entryTimer = null; // pausa breve antes de acercar a Medellín al llegar desde el globo
          let xf = null;         // última transformación dibujada { tx, ty, k, w, h }
          let lastViewBox = '';
          const FADE_MS = 1500;  // un elemento apagado se sigue moviendo mientras termina de desvanecerse (incl. retardos)
          const CULL = 120;      // margen (px) para no reposicionar puntos/etiquetas fuera de pantalla
          // Los puntos con brillo dibujan núcleo + halo con un degradado radial: el círculo es GLOW_R veces el núcleo
          const GLOW_R = 2.4;

          function el(tag, attrs, parent) {
            const node = document.createElementNS(SVG_NS, tag);
            for (const k in attrs) node.setAttribute(k, attrs[k]);
            if (parent) parent.appendChild(node);
            return node;
          }

          // Generador pseudoaleatorio con semilla: el mapa sale idéntico en cada render
          function seeded(seed) {
            return function() {
              seed = (seed * 1664525 + 1013904223) % 4294967296;
              return seed / 4294967296;
            };
          }

          function pointInRing(lng, lat, ring) {
            let inside = false;
            for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
              const [xi, yi] = ring[i], [xj, yj] = ring[j];
              if ((yi > lat) !== (yj > lat) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
            }
            return inside;
          }

          // Elemento superpuesto visible entre los pasos [from, to]
          function overlay(tag, attrs, parent, spec) {
            const node = el(tag, attrs, parent);
            node.classList.add('s5-o');
            items.push({ el: node, ...spec, metro: parent === metroLayer, on: false, offAt: -Infinity, stale: true, out: false });
            return node;
          }

          // Degradados de brillo compartidos (sustituyen cientos de filter: drop-shadow)
          function glowDefs() {
            const defs = el('defs', {}, svg);
            const core = 1 / GLOW_R;
            [['s5GlowGold', '#FFC938'], ['s5GlowMint', '#a7d7c5'], ['s5GlowGreen', '#31BD70'],
             ['s5GlowCoral', '#FC5B5B'], ['s5GlowCity', '#9ff5c4']].forEach(([id, color]) => {
              const g = el('radialGradient', { id }, defs);
              [[0, 1], [core - 0.01, 1], [core + 0.03, 0.55], [core + 0.25, 0.18], [1, 0]].forEach(([o, a]) =>
                el('stop', { offset: o.toFixed(3), 'stop-color': color, 'stop-opacity': a }, g));
            });
          }

          function buildS5Map() {
            svg = document.getElementById('s5MapSvg');
            if (!svg) return;
            svg.replaceChildren();
            items = [];
            xf = null;
            lastViewBox = '';
            glowDefs();

            // --- Capa geográfica en coordenadas base (x = lng, y = -mercator(lat)); la cámara la transforma ---
            camGroup = el('g', {}, svg);
            const ring = coords => coords.map((c, i) =>
              (i ? 'L' : 'M') + c[0].toFixed(2) + ',' + (-merc(c[1])).toFixed(2)).join('') + 'Z';

            const coarse = el('g', { class: 's5-graticule' }, camGroup);
            for (let lng = -180; lng <= 180; lng += 15) el('path', { d: `M${lng},${-merc(84)}V${-merc(-82)}` }, coarse);
            for (let lat = -75; lat <= 75; lat += 15) el('path', { d: `M-180,${-merc(lat)}H180` }, coarse);
            fineGrid = el('g', { class: 's5-graticule' }, camGroup);
            for (let lng = -100; lng <= -50; lng += 2) el('path', { d: `M${lng},${-merc(30)}V${-merc(-20)}` }, fineGrid);
            for (let lat = -20; lat <= 30; lat += 2) el('path', { d: `M-100,${-merc(lat)}H-50` }, fineGrid);

            const features = (window.WORLD_COUNTRIES || {}).features || [];
            let colRing = null;
            const countries = el('g', {}, camGroup);
            features.forEach(f => {
              const g = f.geometry;
              if (!g || f.properties.iso === 'ATA') return;
              const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
              const d = polys.map(p => p.map(ring).join('')).join('');
              if (f.properties.iso === 'COL') { colRing = g.coordinates[0]; return; }
              el('path', { d, class: 's5-country' }, countries);
            });
            // Colombia encima, con brillo (halos de trazo de grosor constante: sin filtro que recalcular en cada cuadro)
            if (colRing) {
              const glow = el('g', { class: 's5-col-glow' }, svg);
              const colCam = el('g', {}, glow);
              const colD = ring(colRing);
              el('path', { d: colD, class: 's5-col-halo' }, colCam);
              el('path', { d: colD, class: 's5-col-halo s5-col-halo--inner' }, colCam);
              el('path', { d: colD, class: 's5-country s5-country--col' }, colCam);
              camGroup.colCam = colCam;
            }

            // Municipios del Valle de Aburrá (Medellín resaltado); se desvanecen al alejarse
            const metroRings = [];
            muniCam = el('g', { class: 's5-munis' }, svg);
            ((window.VALLE_ABURRA || {}).features || []).forEach(f => {
              const isMde = f.properties.code === '001';
              f.geometry.coordinates.forEach(r => metroRings.push(r));
              el('path', { d: f.geometry.coordinates.map(ring).join(''), class: isMde ? 's5-muni s5-muni--mde' : 's5-muni' }, muniCam);
            });
            const inMetro = (lng, lat) => metroRings.some(r => pointInRing(lng, lat, r));

            // --- Superposiciones en coordenadas de pantalla (tamaño constante con cualquier zoom) ---
            const layer = el('g', {}, svg);
            const rand = seeded(42);

            // SAM paso 4: arcos Medellín → región ; TAM paso 7+: arcos Medellín → mundo
            regionCities.forEach(c => overlay('path', { class: 's5-arc s5-arc--gold' }, layer,
              { kind: 'arc', lng: MDE.lng, lat: MDE.lat, to: c, from: 4, to_: 5 }));
            worldHubs.forEach((c, i) => {
              if (i % 3) return;
              overlay('path', { class: 's5-arc s5-arc--gold' }, layer,
                { kind: 'arc', lng: MDE.lng, lat: MDE.lat, to: c, from: 7, to_: 8 });
            });
            // SOM paso 2: enlaces a bancos Open Payments
            colCities.filter(c => c.bank).forEach(c => overlay('path', { class: 's5-arc s5-arc--green' }, layer,
              { kind: 'arc', lng: MDE.lng, lat: MDE.lat, to: c, from: 2, to_: 2 }));

            // SAM paso 3+: usuarios repartidos por toda Colombia
            if (colRing) {
              let n = 0;
              const SAM_DOTS = 110;
              while (n < SAM_DOTS) {
                const lng = -79.1 + rand() * 12.4, lat = -4.3 + rand() * 16.8;
                if (!pointInRing(lng, lat, colRing)) continue;
                const dot = overlay('circle', { r: ((2 + rand() * 1.4) * GLOW_R).toFixed(1), class: 's5-dot s5-dot--green' }, layer,
                  { kind: 'dot', lng, lat, from: 3, to_: 5 });
                dot.style.transitionDelay = `${(n / SAM_DOTS) * 0.9}s`;
                n++;
              }
            }

            // SOM: río, nombres de municipios y puntos de adopción por fase
            // (río y nombres en su propio grupo: solo aparecen con el zoom cercano)
            metroLayer = el('g', {}, layer);
            overlay('path', { class: 's5-river' }, metroLayer, { kind: 'line', pts: riverPts, from: 0, to_: 2 });
            overlay('text', { class: 's5-area-label' }, metroLayer, { kind: 'label', lat: 6.5, lng: -75.76, dx: 0, dy: 0, from: 0, to_: 2 })
              .textContent = 'Área Metropolitana · Valle de Aburrá';
            metroTowns.forEach(t => {
              overlay('circle', { r: 3, class: 's5-town' }, metroLayer, { kind: 'dot', ...t, from: 0, to_: 2 });
              const label = overlay('text', { class: 's5-muni-label' }, metroLayer,
                { kind: 'label', ...t, dx: t.anchor === 'end' ? -9 : 9, dy: t.dy || 4, from: 0, to_: 2 });
              if (t.anchor) label.setAttribute('text-anchor', t.anchor);
              label.textContent = t.name;
            });

            pilotSites.forEach((s, i) => {
              overlay('circle', { r: 6 * GLOW_R, class: 's5-dot s5-dot--gold' }, layer, { kind: 'dot', ...s, from: 0, to_: 2 })
                .style.transitionDelay = `${i * 0.08}s`;
            });
            const somDots = (count, phase, accept) => {
              let n = 0, guard = 0;
              while (n < count && guard++ < 20000) {
                const lng = -75.76 + rand() * 0.53, lat = 5.95 + rand() * 0.56;
                if (!inMetro(lng, lat) || !accept(lng, lat)) continue;
                overlay('circle', { r: ((3 + rand() * 1.6) * GLOW_R).toFixed(1), class: `s5-dot s5-dot--${phase === 1 ? 'mint' : 'green'}` }, layer,
                  { kind: 'dot', lng, lat, from: phase, to_: 2 }).style.transitionDelay = `${(n / count) * 0.7}s`;
                n++;
              }
            };
            // Fase 1: núcleo urbano de Medellín
            somDots(24, 1, (lng, lat) => Math.hypot(lng - MDE.lng, lat - MDE.lat) < 0.065);
            // Fase 2: a lo largo de todo el valle (cerca del eje del río)
            somDots(72, 2, (lng, lat) => riverPts.some(([x, y]) => Math.hypot(lng - x, lat - y) < 0.045));

            // Ciudades de Colombia: punto + etiqueta en SOM; anillo de ingresos en SAM paso 5
            colCities.forEach(c => {
              overlay('circle', { r: 4.5 * GLOW_R, class: 's5-city' }, layer, { kind: 'dot', ...c, from: 0, to_: 5 });
              overlay('text', { class: 's5-city-label' }, layer, { kind: 'label', ...c, dx: 10, dy: 4, from: 0, to_: 2 }).textContent = c.name;
              overlay('circle', { r: 26, class: 's5-ring s5-ring--mint' }, layer, { kind: 'dot', ...c, from: 5, to_: 5 });
            });

            // Región: punto + etiqueta en SAM; anillo en paso 5
            regionCities.forEach(c => {
              overlay('circle', { r: 4 * GLOW_R, class: 's5-city s5-city--gold' }, layer, { kind: 'dot', ...c, from: 3, to_: 5 });
              overlay('text', { class: 's5-city-label' }, layer, { kind: 'label', ...c, dx: 9, dy: 4, from: 3, to_: 5 }).textContent = c.name;
              overlay('circle', { r: 22, class: 's5-ring s5-ring--mint' }, layer, { kind: 'dot', ...c, from: 5, to_: 5 });
            });

            // Mundo: personas fuera de línea (coral, parpadeo) y anillos de ingresos (verde)
            worldHubs.forEach((c, i) => {
              const dot = overlay('circle', { r: 5 * GLOW_R, class: 's5-dot s5-dot--coral s5-blink' }, layer, { kind: 'dot', ...c, from: 6, to_: 8 });
              dot.style.animationDelay = `${(i * 0.37) % 2.4}s`;
              overlay('circle', { r: 24, class: 's5-ring s5-ring--green' }, layer, { kind: 'dot', ...c, from: 8, to_: 8 });
            });

            // Medellín: radar + núcleo + etiqueta (siempre visible: es el origen)
            for (let i = 0; i < 3; i++) {
              overlay('circle', { r: 85, class: 's5-mde-ring' }, layer, { kind: 'dot', ...MDE, from: 0, to_: 8 }).style.animationDelay = `${-i}s`; // negativo: escalonado desde el primer cuadro (sin anillo estático)
            }
            overlay('circle', { r: 8, class: 's5-mde-core' }, layer, { kind: 'dot', ...MDE, from: 0, to_: 8 });
            overlay('text', { class: 's5-mde-label' }, layer, { kind: 'label', ...MDE, dx: 18, dy: -14, from: 0, to_: 8 }).textContent = 'MEDELLÍN';
          }

          // Dibuja un cuadro con la cámara dada
          function drawFrame(c) {
            if (!svg || !camGroup) return;
            const w = window.innerWidth, h = window.innerHeight;
            const vb = `0 0 ${w} ${h}`;
            if (vb !== lastViewBox) { svg.setAttribute('viewBox', vb); lastViewBox = vb; }
            const tx = c.sx * w - c.k * c.lng;
            const ty = c.sy * h + c.k * merc(c.lat);
            const m = `matrix(${c.k} 0 0 ${c.k} ${tx} ${ty})`;
            camGroup.setAttribute('transform', m);
            if (camGroup.colCam) camGroup.colCam.setAttribute('transform', m);
            const muniOp = Math.max(0, Math.min(1, (c.k - 150) / 450));
            const metroOp = Math.max(0, Math.min(1, (c.k - 500) / 500));
            if (muniCam) {
              // Invisible al alejarse: no se transforma ni se pinta
              if (muniOp > 0) muniCam.setAttribute('transform', m);
              muniCam.style.opacity = muniOp;
              muniCam.style.display = muniOp > 0 ? '' : 'none';
            }
            if (metroLayer) {
              metroLayer.style.opacity = metroOp;
              metroLayer.style.display = metroOp > 0 ? '' : 'none';
            }
            fineGrid.style.opacity = Math.max(0, Math.min(1, (c.k - 15) / 40));

            xf = { tx, ty, k: c.k, w, h };
            const now = performance.now();
            for (let i = 0; i < items.length; i++) {
              const it = items[i];
              // Solo se mueven los elementos visibles (o que aún se están desvaneciendo)
              if ((!it.on && now - it.offAt > FADE_MS) || (it.metro && metroOp <= 0)) { it.stale = true; continue; }
              placeItem(it, xf);
            }
          }

          // Reposiciona un elemento superpuesto con la transformación dada
          function placeItem(it, t) {
            const x = t.tx + t.k * it.lng, y = t.ty - t.k * merc(it.lat);
            if (it.kind === 'dot' || it.kind === 'label') {
              // Fuera de pantalla: basta con haberlo dejado fuera una vez
              const out = x < -CULL || x > t.w + CULL || y < -CULL || y > t.h + CULL;
              if (out && it.out && !it.stale) return;
              it.out = out;
              if (it.kind === 'dot') {
                it.el.setAttribute('cx', x.toFixed(1));
                it.el.setAttribute('cy', y.toFixed(1));
              } else {
                it.el.setAttribute('x', (x + it.dx).toFixed(1));
                it.el.setAttribute('y', (y + it.dy).toFixed(1));
              }
            } else if (it.kind === 'line') {
              let d = '';
              for (let i = 0; i < it.pts.length; i++) {
                const [lng, lat] = it.pts[i];
                d += (i ? 'L' : 'M') + (t.tx + t.k * lng).toFixed(1) + ',' + (t.ty - t.k * merc(lat)).toFixed(1);
              }
              it.el.setAttribute('d', d);
            } else {
              const qx = t.tx + t.k * it.to.lng, qy = t.ty - t.k * merc(it.to.lat);
              const mx = (x + qx) / 2 + (qy - y) * 0.22;
              const my = (y + qy) / 2 - (qx - x) * 0.22 - Math.hypot(qx - x, qy - y) * 0.12;
              it.el.setAttribute('d', `M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${qx.toFixed(1)},${qy.toFixed(1)}`);
            }
            it.stale = false;
          }

          // Vuelo de cámara: centro lineal en coordenadas proyectadas, zoom geométrico, easing suave
          function flyTo(target, duration, onDone) {
            if (anim) cancelAnimationFrame(anim);
            if (!cam || !duration) { cam = target; drawFrame(cam); if (onDone) onDone(); return; }
            const from = { ...cam, my: merc(cam.lat) };
            const toMy = merc(target.lat);
            const t0 = performance.now();
            const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const tick = now => {
              const t = Math.min(1, (now - t0) / duration);
              const e = ease(t);
              const my = from.my + (toMy - from.my) * e;
              cam = {
                lng: from.lng + (target.lng - from.lng) * e,
                lat: Math.atan(Math.sinh(my * Math.PI / 180)) * 180 / Math.PI,
                sx: from.sx + (target.sx - from.sx) * e,
                sy: from.sy + (target.sy - from.sy) * e,
                k: from.k * Math.pow(target.k / from.k, e)
              };
              drawFrame(cam);
              anim = t < 1 ? requestAnimationFrame(tick) : null;
              if (t >= 1 && onDone) onDone();
            };
            anim = requestAnimationFrame(tick);
          }

          // startCam: cámara inicial explícita (llegada desde el globo) en lugar de la del nivel
          function applyStep(animate, startCam) {
            const slide5 = document.getElementById('slide5');
            if (!slide5) return;
            const stage = stageOf(s5Step);
            const prevStage = svg ? Number(svg.dataset.stage) : stage;
            const viewport = slide5.querySelector('.s5-viewport');
            if (viewport) viewport.dataset.stage = String(stage);
            if (svg) {
              svg.dataset.stage = String(stage);
              svg.dataset.step = String(s5Step);
            }
            const now = performance.now();
            items.forEach(it => {
              const on = s5Step >= it.from && s5Step <= it.to_;
              if (on === it.on) return;
              it.on = on;
              if (!on) it.offAt = now;
              // Si estaba oculto y la cámara se movió, se coloca antes de empezar a aparecer
              else if (it.stale && xf) placeItem(it, xf);
              it.el.classList.toggle('on', on);
            });
            if (startCam) flyTo(startCam, 0);
            else if (!animate || stage !== prevStage || !cam) {
              if (entryTimer) { clearTimeout(entryTimer); entryTimer = null; }
              flyTo(cameraFor(stage), animate ? 2000 : 0);
            }

            const kicker = document.getElementById('s5Kicker');
            const kText = document.getElementById('s5KickerText');
            if (kicker) kicker.dataset.stage = String(stage);
            if (kText) kText.textContent = kickerTexts[stage];

            slide5.querySelectorAll('.s5-step').forEach((s, i) => {
              s.classList.toggle('active', i === s5Step);
              s.classList.toggle('past', i < s5Step);
            });
            slide5.querySelectorAll('[data-s5-dot]').forEach(d => {
              const i = Number(d.dataset.s5Dot);
              d.classList.toggle('lit', i <= s5Step);
              d.classList.toggle('current', i === s5Step);
            });
            slide5.querySelectorAll('[data-s5-group]').forEach(g => {
              g.classList.toggle('lit', Number(g.dataset.s5Group) <= stage);
              g.classList.toggle('current', Number(g.dataset.s5Group) === stage);
            });
            slide5.querySelectorAll('.s5-phase-line[data-s5-line]').forEach(l => {
              l.classList.toggle('lit', Number(l.dataset.s5Line) <= s5Step);
            });
          }

          window.setS5Step = function(idx, animate = true, startCam) {
            s5Step = Math.max(0, Math.min(totalS5 - 1, idx));
            applyStep(animate, startCam);
          };

          // Al entrar avanzando arranca en Medellín; al volver desde la siguiente, en el mundo
          // Desde la 3 llega a la escala del globo (Colombia): se queda quieto mientras termina el fundido
          // sobre el globo y luego acerca hasta el Valle de Aburrá
          const ENTRY_HOLD_MS = 450;
          window.enterS5 = function(fromForward) {
            leavingS5 = false;
            if (entryTimer) { clearTimeout(entryTimer); entryTimer = null; }
            if (anim) { cancelAnimationFrame(anim); anim = null; }
            window.setS5Step(fromForward ? 0 : totalS5 - 1, false, fromForward ? arrivalCam() : null);
            if (fromForward) {
              entryTimer = setTimeout(() => {
                entryTimer = null;
                flyTo(cameraFor(stageOf(s5Step)), 2200);
              }, ENTRY_HOLD_MS);
            }
          };

          // Flechas izquierda/derecha recorren los datos antes de cambiar de diapositiva
          document.addEventListener('keydown', function(e) {
            const slide5 = document.getElementById('slide5');
            if (!slide5 || !slide5.classList.contains('active')) return;
            if (leavingS5) {
              e.preventDefault();
              e.stopImmediatePropagation();
              return;
            }
            if (e.key === 'ArrowRight' || e.key === ' ') {
              if (s5Step < totalS5 - 1) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.setS5Step(s5Step + 1);
              }
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              e.stopImmediatePropagation();
              if (s5Step > 0) {
                window.setS5Step(s5Step - 1);
              } else {
                // Volver a la 3: se aleja a la escala del globo y luego cambia de diapositiva
                leavingS5 = true;
                if (entryTimer) { clearTimeout(entryTimer); entryTimer = null; }
                flyTo(arrivalCam(), 1400, () => prevSlide());
              }
            }
          }, true);

          buildS5Map();
          window.setS5Step(0, false);
          window.addEventListener('resize', () => {
            if (anim) cancelAnimationFrame(anim);
            cam = cameraFor(stageOf(s5Step));
            drawFrame(cam);
          });
        })();

// Core Presentation Navigation & Globe.gl Initialization
const slides = document.querySelectorAll('section.slide');
    const progress = document.getElementById('progressFill');
    let current = 0;

    // Transición 3 ↔ 4: el globo se acerca a Medellín hasta coincidir con el mapa de la diapositiva 4
    // (misma posición en pantalla y misma escala que la cámara SOM: h / 10.5 px por grado)
    const S3_MDE_POV = { lat: 6.2442, lng: -75.5812, altitude: 0.2 };
    const S3_DIVE_MS = 1700;
    const S3_FADE_MS = 600;       // = transición de opacidad de #slide3 / #slide5 en slides.css
    const S3_UNDIVE_HOLD_MS = 450; // al volver, el globo espera a que el mapa casi se desvanezca antes de alejarse
    let s3Diving = false;
    let s3PauseTimer = null;

    function showSlide(index, skipDive) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      if (s3Diving) return;
      if (!skipDive && current === 2 && index === 3 && globeInstance) {
        s3Diving = true;
        slides[2].classList.add('s3-diving');
        const controls = globeInstance.controls();
        if (controls) controls.autoRotate = false;
        globeInstance.pointOfView(S3_MDE_POV, S3_DIVE_MS);
        setTimeout(() => {
          s3Diving = false;
          // El globo se queda opaco debajo mientras el mapa (encima) termina de aparecer: un solo fundido
          slides[2].classList.add('s34-hold');
          showSlide(3, true);
          // (el texto de la 3 sigue oculto hasta que el globo deja de verse)
          setTimeout(() => {
            slides[2].classList.remove('s34-hold');
            if (current !== 2) slides[2].classList.remove('s3-diving');
          }, S3_FADE_MS + 100);
        }, S3_DIVE_MS);
        return;
      }
      const prev = current;
      current = index;
      // 4 → 3: el globo aparece al instante debajo del mapa, que se desvanece encima
      if (current === 2 && prev === 3) {
        slides[2].classList.add('s34-under');
        setTimeout(() => slides[2].classList.remove('s34-under'), S3_FADE_MS + 100);
      }
      slides.forEach((s, i) => s.classList.toggle('active', i === current));
      // El globo WebGL solo renderiza mientras la 3 está en pantalla (fuera de ella costaba ~60 ms por cuadro)
      if (globeInstance) {
        clearTimeout(s3PauseTimer);
        if (current === 2) globeInstance.resumeAnimation();
        else s3PauseTimer = setTimeout(() => { if (current !== 2) globeInstance.pauseAnimation(); }, S3_FADE_MS + 100);
      }
      if (prev !== current && stepEnter[slides[current].id]) {
        stepEnter[slides[current].id](prev < current);
      }
      if (slides[current].id === 'slide5' && prev !== current && window.enterS5) {
        window.enterS5(prev < current);
      }
      if (current === 2) {
        const fromMap = prev === 3 && globeInstance;
        if (fromMap) {
          // Volviendo desde la 4: arranca pegado a Medellín y se aleja hasta el globo completo
          slides[2].classList.add('s3-diving');
          globeInstance.pointOfView(S3_MDE_POV, 0);
        }
        setTimeout(() => {
          if (!globeInstance) {
            initColombiaGlobe();
          } else {
            updateGlobePosition();
            globeInstance.pointOfView({ lat: S3_START_LAT, lng: S3_START_LNG, altitude: s3GlobeAltitude() }, fromMap ? 2000 : 350);
          }
          setTimeout(() => slides[2].classList.remove('s3-diving'), fromMap ? 1100 : 0);
        }, fromMap ? S3_UNDIVE_HOLD_MS : 120);
      } else if (!slides[2].classList.contains('s34-hold')) {
        slides[2].classList.remove('s3-diving');
      }
      if (progress) progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    }

    function nextSlide() { showSlide(current + 1); }
    function prevSlide() { showSlide(current - 1); }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        showSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        showSlide(slides.length - 1);
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullScreen();
      }
    });

    function toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

        // ==========================================
    // GLOBE.GL — GLOBO HOLOGRÁFICO TRANSPARENTE
    // ==========================================
    const colombiaGeoJson = {"type": "FeatureCollection", "features": [{"type": "Feature", "id": "COL", "properties": {"name": "Colombia"}, "geometry": {"type": "Polygon", "coordinates": [[[-75.373223, -0.152032], [-75.801466, 0.084801], [-76.292314, 0.416047], [-76.57638, 0.256936], [-77.424984, 0.395687], [-77.668613, 0.825893], [-77.855061, 0.809925], [-78.855259, 1.380924], [-78.990935, 1.69137], [-78.617831, 1.766404], [-78.662118, 2.267355], [-78.42761, 2.629556], [-77.931543, 2.696606], [-77.510431, 3.325017], [-77.12769, 3.849636], [-77.496272, 4.087606], [-77.307601, 4.667984], [-77.533221, 5.582812], [-77.318815, 5.845354], [-77.476661, 6.691116], [-77.881571, 7.223771], [-77.753414, 7.70984], [-77.431108, 7.638061], [-77.242566, 7.935278], [-77.474723, 8.524286], [-77.353361, 8.670505], [-76.836674, 8.638749], [-76.086384, 9.336821], [-75.6746, 9.443248], [-75.664704, 9.774003], [-75.480426, 10.61899], [-74.906895, 11.083045], [-74.276753, 11.102036], [-74.197223, 11.310473], [-73.414764, 11.227015], [-72.627835, 11.731972], [-72.238195, 11.95555], [-71.75409, 12.437303], [-71.399822, 12.376041], [-71.137461, 12.112982], [-71.331584, 11.776284], [-71.973922, 11.608672], [-72.227575, 11.108702], [-72.614658, 10.821975], [-72.905286, 10.450344], [-73.027604, 9.73677], [-73.304952, 9.152], [-72.78873, 9.085027], [-72.660495, 8.625288], [-72.439862, 8.405275], [-72.360901, 8.002638], [-72.479679, 7.632506], [-72.444487, 7.423785], [-72.198352, 7.340431], [-71.960176, 6.991615], [-70.674234, 7.087785], [-70.093313, 6.960376], [-69.38948, 6.099861], [-68.985319, 6.206805], [-68.265052, 6.153268], [-67.695087, 6.267318], [-67.34144, 6.095468], [-67.521532, 5.55687], [-67.744697, 5.221129], [-67.823012, 4.503937], [-67.621836, 3.839482], [-67.337564, 3.542342], [-67.303173, 3.318454], [-67.809938, 2.820655], [-67.447092, 2.600281], [-67.181294, 2.250638], [-66.876326, 1.253361], [-67.065048, 1.130112], [-67.259998, 1.719999], [-67.53781, 2.037163], [-67.868565, 1.692455], [-69.816973, 1.714805], [-69.804597, 1.089081], [-69.218638, 0.985677], [-69.252434, 0.602651], [-69.452396, 0.706159], [-70.015566, 0.541414], [-70.020656, -0.185156], [-69.577065, -0.549992], [-69.420486, -1.122619], [-69.444102, -1.556287], [-69.893635, -4.298187], [-70.394044, -3.766591], [-70.692682, -3.742872], [-70.047709, -2.725156], [-70.813476, -2.256865], [-71.413646, -2.342802], [-71.774761, -2.16979], [-72.325787, -2.434218], [-73.070392, -2.308954], [-73.659504, -1.260491], [-74.122395, -1.002833], [-74.441601, -0.53082], [-75.106625, -0.057205], [-75.373223, -0.152032]]]}}]};

    const citiesData = [
      { name: 'Medellín', lat: 6.2442, lng: -75.5812, size: 0.28, color: '#FFC938' },
      { name: 'Bogotá', lat: 4.7110, lng: -74.0721, size: 0.24, color: '#9ff5c4' },
      { name: 'Cali', lat: 3.4516, lng: -76.5320, size: 0.22, color: '#9ff5c4' }
    ];

    // Principales ciudades del mundo (puntos amarillos parpadeando)
    const worldCitiesData = [
      { name: 'New York', lat: 40.71, lng: -74.01 }, { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
      { name: 'Toronto', lat: 43.65, lng: -79.38 }, { name: 'Mexico City', lat: 19.43, lng: -99.13 },
      { name: 'Panamá', lat: 8.98, lng: -79.52 }, { name: 'Lima', lat: -12.05, lng: -77.04 },
      { name: 'São Paulo', lat: -23.55, lng: -46.63 }, { name: 'Buenos Aires', lat: -34.6, lng: -58.38 },
      { name: 'Santiago', lat: -33.45, lng: -70.67 }, { name: 'London', lat: 51.51, lng: -0.13 },
      { name: 'Paris', lat: 48.86, lng: 2.35 }, { name: 'Madrid', lat: 40.42, lng: -3.7 },
      { name: 'Istanbul', lat: 41.01, lng: 28.98 }, { name: 'Moscow', lat: 55.76, lng: 37.62 },
      { name: 'Lagos', lat: 6.52, lng: 3.38 }, { name: 'Cairo', lat: 30.04, lng: 31.24 },
      { name: 'Nairobi', lat: -1.29, lng: 36.82 }, { name: 'Johannesburg', lat: -26.2, lng: 28.05 },
      { name: 'Dubai', lat: 25.2, lng: 55.27 }, { name: 'Mumbai', lat: 19.08, lng: 72.88 },
      { name: 'Delhi', lat: 28.61, lng: 77.21 }, { name: 'Beijing', lat: 39.9, lng: 116.41 },
      { name: 'Shanghai', lat: 31.23, lng: 121.47 }, { name: 'Tokyo', lat: 35.68, lng: 139.69 },
      { name: 'Seoul', lat: 37.57, lng: 126.98 }, { name: 'Singapore', lat: 1.35, lng: 103.82 },
      { name: 'Jakarta', lat: -6.2, lng: 106.85 }, { name: 'Sydney', lat: -33.87, lng: 151.21 },
      // Latinoamérica
      { name: 'Guatemala', lat: 14.63, lng: -90.51 }, { name: 'San José', lat: 9.93, lng: -84.08 },
      { name: 'La Habana', lat: 23.11, lng: -82.37 }, { name: 'Santo Domingo', lat: 18.49, lng: -69.93 },
      { name: 'San Juan', lat: 18.47, lng: -66.11 }, { name: 'Caracas', lat: 10.48, lng: -66.9 },
      { name: 'Quito', lat: -0.18, lng: -78.47 }, { name: 'Guayaquil', lat: -2.17, lng: -79.92 },
      { name: 'La Paz', lat: -16.5, lng: -68.15 }, { name: 'Asunción', lat: -25.26, lng: -57.58 },
      { name: 'Montevideo', lat: -34.9, lng: -56.16 }, { name: 'Rio de Janeiro', lat: -22.91, lng: -43.17 },
      { name: 'Brasília', lat: -15.79, lng: -47.88 }, { name: 'Manaus', lat: -3.12, lng: -60.02 },
      { name: 'Recife', lat: -8.05, lng: -34.88 }, { name: 'Monterrey', lat: 25.69, lng: -100.32 },
      { name: 'Guadalajara', lat: 20.66, lng: -103.35 }, { name: 'Cancún', lat: 21.16, lng: -86.85 },
      { name: 'Miami', lat: 25.76, lng: -80.19 },
      // Europa
      { name: 'Lisboa', lat: 38.72, lng: -9.14 }, { name: 'Barcelona', lat: 41.39, lng: 2.17 },
      { name: 'Roma', lat: 41.9, lng: 12.5 }, { name: 'Milano', lat: 45.46, lng: 9.19 },
      { name: 'Berlin', lat: 52.52, lng: 13.4 }, { name: 'Amsterdam', lat: 52.37, lng: 4.9 },
      { name: 'Bruselas', lat: 50.85, lng: 4.35 }, { name: 'Zürich', lat: 47.38, lng: 8.54 },
      { name: 'Viena', lat: 48.21, lng: 16.37 }, { name: 'Varsovia', lat: 52.23, lng: 21.01 },
      { name: 'Estocolmo', lat: 59.33, lng: 18.07 }, { name: 'Dublín', lat: 53.35, lng: -6.26 },
      { name: 'Atenas', lat: 37.98, lng: 23.73 }, { name: 'Kyiv', lat: 50.45, lng: 30.52 },
      // África
      { name: 'Casablanca', lat: 33.57, lng: -7.59 }, { name: 'Argel', lat: 36.75, lng: 3.06 },
      { name: 'Túnez', lat: 36.81, lng: 10.18 }, { name: 'Dakar', lat: 14.72, lng: -17.47 },
      { name: 'Abiyán', lat: 5.36, lng: -4.01 }, { name: 'Accra', lat: 5.6, lng: -0.19 },
      { name: 'Kinshasa', lat: -4.44, lng: 15.27 }, { name: 'Luanda', lat: -8.84, lng: 13.23 },
      { name: 'Addis Abeba', lat: 9.03, lng: 38.74 }, { name: 'Dar es Salaam', lat: -6.79, lng: 39.21 },
      { name: 'Kampala', lat: 0.35, lng: 32.58 }, { name: 'Ciudad del Cabo', lat: -33.92, lng: 18.42 },
      { name: 'Jartum', lat: 15.5, lng: 32.56 }
    ];

    const ringsData = [
      { lat: 6.2442, lng: -75.5812, maxR: 8.5, propagationSpeed: 3.2, repeatPeriod: 1000 }
    ];

    let globeInstance = null;
    const S3_GLOBE_FOV = 50; // FOV vertical por defecto de globe.gl
    // Vista inicial al oeste de Colombia: el giro la lleva de derecha a izquierda y dura más en pantalla
    const S3_START_LAT = 4.8;
    const S3_START_LNG = -87;
    const S3_GLOBE_ZOOM = 1.8; // >1 agranda el globo (1 = cabe completo en la mitad izquierda)

    // Altitud de cámara para que el globo completo ocupe la mitad izquierda sin cortarse
    function s3GlobeAltitude() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const radiusPx = Math.min(w * 0.5 * 0.46, h * 0.44) * S3_GLOBE_ZOOM;
      const t = Math.tan((S3_GLOBE_FOV / 2) * Math.PI / 180);
      return Math.sqrt(1 + Math.pow((h / 2) / (radiusPx * t), 2)) - 1;
    }

    function updateGlobePosition() {
      if (!globeInstance) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Canvas a pantalla completa (sin bordes duros) y la vista desplazada
      // para que el centro del globo quede en el centro de la mitad izquierda
      globeInstance.width(w).height(h);
      const camera = globeInstance.camera();
      if (camera) {
        camera.setViewOffset(w, h, w * 0.25, 0, w, h);
      }
      const controls = globeInstance.controls();
      if (controls) {
        controls.target.set(0, 0, 0);
        controls.autoRotate = true;
        controls.autoRotateSpeed = -0.15;
        controls.enableZoom = true;
      }
    }

    function initColombiaGlobe() {
      const container = document.getElementById('globeViz');
      if (!container) return;

      if (globeInstance) {
        updateGlobePosition();
        return;
      }

      // Todos los países solo delineados + Colombia resaltada encima
      const worldFeatures = ((window.WORLD_COUNTRIES || {}).features || [])
        .filter(f => f.properties.iso !== 'COL')
        .map(f => ({ ...f, isColombia: false }));
      const polygons = worldFeatures.concat(
        colombiaGeoJson.features.map(f => ({ ...f, isColombia: true }))
      );

      globeInstance = Globe()
        (container)
        .width(window.innerWidth)
        .height(window.innerHeight)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#34c77b')
        .atmosphereAltitude(0.18)
        .showGraticules(true)

        .polygonsData(polygons)
        .polygonCapColor(d => d.isColombia ? 'rgba(52, 199, 123, 0.45)' : 'rgba(52, 199, 123, 0.04)')
        .polygonSideColor(d => d.isColombia ? 'rgba(49, 189, 112, 0.35)' : 'rgba(0, 0, 0, 0)')
        .polygonStrokeColor(d => d.isColombia ? '#34c77b' : 'rgba(140, 230, 180, 0.45)')
        .polygonAltitude(d => d.isColombia ? 0.006 : 0.004)

        // Ciudades del mundo: punto HTML con parpadeo CSS (se ocultan en la cara trasera)
        .htmlElementsData(worldCitiesData.concat(citiesData.map(c => ({ ...c, colombia: true }))))
        .htmlLat(d => d.lat)
        .htmlLng(d => d.lng)
        .htmlAltitude(0.006)
        .htmlElement((d, i) => {
          const el = document.createElement('div');
          el.className = d.colombia ? 's3-city-dot s3-city-dot--col' : 's3-city-dot';
          if (d.colombia) el.style.setProperty('--dot', d.color);
          el.title = d.name;
          el.style.animationDelay = `${(i * 0.37) % 2.4}s`;
          return el;
        })

        // Radar en Medellín
        .ringsData(ringsData)
        .ringLat(d => d.lat)
        .ringLng(d => d.lng)
        .ringColor(() => t => `rgba(255, 201, 56, ${1 - t})`)
        .ringMaxRadius(d => d.maxR)
        .ringPropagationSpeed(d => d.propagationSpeed)
        .ringRepeatPeriod(d => d.repeatPeriod);

      // Esfera casi opaca en el mismo tono del fondo: se integra y oculta los contornos de la cara trasera
      const mat = globeInstance.globeMaterial();
      if (mat) {
        mat.color.set('#0b2418');
        mat.transparent = true;
        mat.opacity = 0.9;
        mat.roughness = 0.8;
      }

      updateGlobePosition();

      // Enfocar Colombia
      globeInstance.pointOfView({ lat: S3_START_LAT, lng: S3_START_LNG, altitude: s3GlobeAltitude() }, 0);

      window.addEventListener('resize', () => {
        if (globeInstance) {
          updateGlobePosition();
          globeInstance.pointOfView({ altitude: s3GlobeAltitude() }, 0);
        }
      });
    }

    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(initColombiaGlobe, 120);
    });

    // Inicializar primera diapositiva y barra de progreso
    showSlide(0);
