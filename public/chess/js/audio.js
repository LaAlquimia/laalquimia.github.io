/**
 * ChessAudio - Web Audio API Synthesizer Engine for Chess
 * Zero external audio file dependencies. Instant loading and zero latency.
 *
 * Themes:
 *   - 'wood': Realistic tactile wooden chess piece clicks, captures, and resonant thuds
 *   - 'modern': Soft acoustic clicks, harmonic bell blips, and clean melodic alerts
 *   - 'arcade': Retro 8-bit chiptune square-wave arpeggios, chirps, and crunch effects
 *   - 'synth': Futuristic sci-fi FM pulses, laser sweeps, and cosmic shimmer chords
 *
 * Events:
 *   - 'move', 'capture', 'check', 'castle', 'promote', 'game_end', 'illegal'
 */

(function (global) {
  'use strict';

  let audioCtx = null;
  let masterGain = null;
  let currentVolume = 0.5;
  let isMutedState = false;
  let currentTheme = 'wood';
  const soundThemes = ['wood', 'modern', 'arcade', 'synth'];

  // Buffer cache for noise generation
  let noiseBuffer = null;

  /**
   * Initializes or returns the AudioContext
   */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(isMutedState ? 0 : currentVolume, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  /**
   * Pre-generates a 1-second white noise buffer for realistic percussion & physical textures
   */
  function getNoiseBuffer(ctx) {
    if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) {
      return noiseBuffer;
    }
    const bufferSize = ctx.sampleRate * 1; // 1 second
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return noiseBuffer;
  }

  /**
   * Unlocks AudioContext on first user interaction
   */
  function setupAutoUnlock() {
    const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown', 'mousedown', 'pointerdown'];
    function unlock() {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      unlockEvents.forEach(evt => document.removeEventListener(evt, unlock, true));
    }
    unlockEvents.forEach(evt => document.addEventListener(evt, unlock, { capture: true, passive: true }));
  }

  if (typeof document !== 'undefined') {
    setupAutoUnlock();
  }


  // =========================================================================
  // THEME IMPLEMENTATIONS
  // =========================================================================

  const themes = {
    // -----------------------------------------------------------------------
    // 1. WOOD THEME (Physical Wood Impacts & Resonant Tactile Knocks)
    // -----------------------------------------------------------------------
    wood: {
      move(ctx, out, time) {
        // High click transient + resonant wood block impulse
        const t0 = time;

        // Click transient (filtered noise burst)
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1800, t0);
        noiseFilter.Q.setValueAtTime(3.0, t0);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, t0);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.025);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(out);
        noise.start(t0);
        noise.stop(t0 + 0.03);

        // Resonant wood body knock
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(460, t0);
        osc.frequency.exponentialRampToValueAtTime(140, t0 + 0.06);

        oscGain.gain.setValueAtTime(0.9, t0);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);

        osc.connect(oscGain);
        oscGain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.075);
      },

      capture(ctx, out, time) {
        // Heavy double-impact wood knock (piece striking piece + board thud)
        const t0 = time;

        // First piece-on-piece knock (sharp high transient)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(680, t0);
        osc1.frequency.exponentialRampToValueAtTime(220, t0 + 0.04);
        gain1.gain.setValueAtTime(0.8, t0);
        gain1.gain.exponentialRampToValueAtTime(0.001, t0 + 0.045);
        osc1.connect(gain1);
        gain1.connect(out);
        osc1.start(t0);
        osc1.stop(t0 + 0.05);

        // Second heavier wood board impact at t0 + 35ms
        const t1 = t0 + 0.035;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(320, t1);
        osc2.frequency.exponentialRampToValueAtTime(90, t1 + 0.09);
        gain2.gain.setValueAtTime(1.0, t1);
        gain2.gain.exponentialRampToValueAtTime(0.001, t1 + 0.1);
        osc2.connect(gain2);
        gain2.connect(out);
        osc2.start(t1);
        osc2.stop(t1 + 0.11);

        // Low board thump
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(130, t1);
        subOsc.frequency.exponentialRampToValueAtTime(50, t1 + 0.12);
        subGain.gain.setValueAtTime(0.7, t1);
        subGain.gain.exponentialRampToValueAtTime(0.001, t1 + 0.12);
        subOsc.connect(subGain);
        subGain.connect(out);
        subOsc.start(t1);
        subOsc.stop(t1 + 0.13);
      },

      check(ctx, out, time) {
        // Resonant wood alert knock with high harmonic ring
        const t0 = time;
        [580, 880, 1160].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t0 + 0.14);
          gain.gain.setValueAtTime(0.6 / (i + 1), t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.15);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t0);
          osc.stop(t0 + 0.16);
        });
      },

      castle(ctx, out, time) {
        // Two consecutive wood piece movements (King moves, then Rook lands)
        themes.wood.move(ctx, out, time);
        themes.wood.move(ctx, out, time + 0.12);
      },

      promote(ctx, out, time) {
        // Rich ascending woodblock chime (4 notes)
        const notes = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
        notes.forEach((freq, idx) => {
          const t = time + idx * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.95, t + 0.12);
          gain.gain.setValueAtTime(0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.14);
        });
      },

      game_end(ctx, out, time) {
        // Deep resolving wooden gong chord
        const chords = [261.63, 329.63, 392.00, 523.25]; // C4 major
        chords.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.5 / (i * 0.5 + 1), time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
          osc.connect(gain);
          gain.connect(out);
          osc.start(time);
          osc.stop(time + 0.65);
        });
      },

      illegal(ctx, out, time) {
        // Dull double wood thud error
        [0, 0.07].forEach(offset => {
          const t = time + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, t);
          osc.frequency.exponentialRampToValueAtTime(70, t + 0.05);
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.07);
        });
      }
    },

    // -----------------------------------------------------------------------
    // 2. MODERN THEME (Acoustic Blips, Soft Harmonic Bells)
    // -----------------------------------------------------------------------
    modern: {
      move(ctx, out, time) {
        // Crisp gentle sine blip with quick pitch drop
        const t0 = time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t0);
        osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.04);
        gain.gain.setValueAtTime(0.7, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.045);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.05);
      },

      capture(ctx, out, time) {
        // Modern snappy crisp snap + dual harmonic
        const t0 = time;
        [600, 1200].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, t0);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t0 + 0.06);
          gain.gain.setValueAtTime(0.8 / (idx + 1), t0);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.07);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t0);
          osc.stop(t0 + 0.08);
        });
      },

      check(ctx, out, time) {
        // Two-tone modern alert chime (E5 -> A5)
        [659.25, 880.00].forEach((freq, i) => {
          const t = time + i * 0.08;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.65, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.2);
        });
      },

      castle(ctx, out, time) {
        // Two-step modern acoustic chord (F4 -> C5)
        [349.23, 523.25].forEach((freq, i) => {
          const t = time + i * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.7, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.13);
        });
      },

      promote(ctx, out, time) {
        // Elegant ascending major triad bell chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const t = time + i * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.6, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.24);
        });
      },

      game_end(ctx, out, time) {
        // Modern lush resolution chord (Cmaj7)
        const notes = [261.63, 329.63, 392.00, 493.88, 523.25];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.4 / (i * 0.3 + 1), time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
          osc.connect(gain);
          gain.connect(out);
          osc.start(time);
          osc.stop(time + 0.85);
        });
      },

      illegal(ctx, out, time) {
        // Soft double warning blip
        [220, 180].forEach((freq, i) => {
          const t = time + i * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.06);
        });
      }
    },

    // -----------------------------------------------------------------------
    // 3. ARCADE THEME (8-Bit Retro Chiptune & Square Wave FX)
    // -----------------------------------------------------------------------
    arcade: {
      move(ctx, out, time) {
        // 8-bit upward jump chirp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, time);
        osc.frequency.setValueAtTime(480, time + 0.015);
        osc.frequency.setValueAtTime(720, time + 0.03);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.055);
        osc.connect(gain);
        gain.connect(out);
        osc.start(time);
        osc.stop(time + 0.06);
      },

      capture(ctx, out, time) {
        // 8-bit crunch / explosion impact
        const noise = ctx.createBufferSource();
        noise.buffer = getNoiseBuffer(ctx);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(2000, time);
        noiseFilter.frequency.exponentialRampToValueAtTime(200, time + 0.08);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.7, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(out);
        noise.start(time);
        noise.stop(time + 0.1);

        // Low 8-bit zap
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);
        oscGain.gain.setValueAtTime(0.4, time);
        oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.085);
        osc.connect(oscGain);
        oscGain.connect(out);
        osc.start(time);
        osc.stop(time + 0.09);
      },

      check(ctx, out, time) {
        // Fast 8-bit alert arpeggio
        const notes = [659.25, 880.00, 1318.51];
        notes.forEach((freq, idx) => {
          const t = time + idx * 0.035;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.045);
        });
      },

      castle(ctx, out, time) {
        // 8-bit twin warp chirp
        [0, 0.08].forEach((offset, idx) => {
          const t = time + offset;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(idx === 0 ? 300 : 500, t);
          osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 600 : 900, t + 0.04);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.055);
        });
      },

      promote(ctx, out, time) {
        // 8-bit power-up ascending fanfare
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const t = time + idx * 0.04;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.055);
        });
      },

      game_end(ctx, out, time) {
        // 8-bit victory / game over melody
        const melody = [
          { f: 523.25, d: 0.1 },
          { f: 659.25, d: 0.1 },
          { f: 783.99, d: 0.1 },
          { f: 1046.50, d: 0.25 }
        ];
        let currentT = time;
        melody.forEach(item => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(item.f, currentT);
          gain.gain.setValueAtTime(0.35, currentT);
          gain.gain.exponentialRampToValueAtTime(0.001, currentT + item.d - 0.01);
          osc.connect(gain);
          gain.connect(out);
          osc.start(currentT);
          osc.stop(currentT + item.d);
          currentT += item.d;
        });
      },

      illegal(ctx, out, time) {
        // 8-bit low dissonant buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, time);
        osc.frequency.setValueAtTime(110, time + 0.04);
        gain.gain.setValueAtTime(0.4, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
        osc.connect(gain);
        gain.connect(out);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    },

    // -----------------------------------------------------------------------
    // 4. SYNTH THEME (Futuristic Sci-Fi FM & Resonant Modulations)
    // -----------------------------------------------------------------------
    synth: {
      move(ctx, out, time) {
        // Cyber pulse laser blip (FM Modulation)
        const t0 = time;
        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const master = ctx.createGain();

        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(550, t0);
        carrier.frequency.exponentialRampToValueAtTime(180, t0 + 0.06);

        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(220, t0);

        modGain.gain.setValueAtTime(400, t0);
        modGain.gain.exponentialRampToValueAtTime(0.01, t0 + 0.05);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        master.gain.setValueAtTime(0.65, t0);
        master.gain.exponentialRampToValueAtTime(0.001, t0 + 0.065);

        carrier.connect(master);
        master.connect(out);

        modulator.start(t0);
        carrier.start(t0);
        modulator.stop(t0 + 0.07);
        carrier.stop(t0 + 0.07);
      },

      capture(ctx, out, time) {
        // Plasma discharge impact (Sub-bass + sweeping resonant filter)
        const t0 = time;

        // Sub bass pulse
        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(180, t0);
        sub.frequency.exponentialRampToValueAtTime(40, t0 + 0.12);
        subGain.gain.setValueAtTime(0.9, t0);
        subGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.13);
        sub.connect(subGain);
        subGain.connect(out);
        sub.start(t0);
        sub.stop(t0 + 0.14);

        // Resonant high-tech snap
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, t0);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3500, t0);
        filter.frequency.exponentialRampToValueAtTime(300, t0 + 0.08);
        filter.Q.setValueAtTime(5, t0);

        gain.gain.setValueAtTime(0.5, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.085);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(out);

        osc.start(t0);
        osc.stop(t0 + 0.09);
      },

      check(ctx, out, time) {
        // Holographic cyber shimmer alert
        const t0 = time;
        [880, 1320, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t0 + idx * 0.03);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.15, t0 + idx * 0.03 + 0.12);
          gain.gain.setValueAtTime(0.4 / (idx + 1), t0 + idx * 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t0 + idx * 0.03 + 0.14);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t0 + idx * 0.03);
          osc.stop(t0 + idx * 0.03 + 0.15);
        });
      },

      castle(ctx, out, time) {
        // Warp phase sweep
        [0, 0.09].forEach((offset, idx) => {
          const t = time + offset;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(idx === 0 ? 220 : 330, t);
          osc.frequency.exponentialRampToValueAtTime(idx === 0 ? 440 : 660, t + 0.07);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1000, t);
          filter.Q.setValueAtTime(4, t);

          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.075);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(out);

          osc.start(t);
          osc.stop(t + 0.08);
        });
      },

      promote(ctx, out, time) {
        // Futuristic level-up riser with FM harmonic sparkle
        const notes = [440, 554.37, 659.25, 880, 1108.73];
        notes.forEach((freq, idx) => {
          const t = time + idx * 0.05;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.linearRampToValueAtTime(freq * 1.05, t + 0.15);
          gain.gain.setValueAtTime(0.5, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(out);
          osc.start(t);
          osc.stop(t + 0.2);
        });
      },

      game_end(ctx, out, time) {
        // Sci-Fi cinematic synth pad swell
        const freqs = [196.00, 293.66, 392.00, 493.88, 587.33]; // G major 9th
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gain = ctx.createGain();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, time);
          filter.frequency.exponentialRampToValueAtTime(2400, time + 0.4);
          filter.frequency.exponentialRampToValueAtTime(400, time + 0.9);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.25 / (idx * 0.3 + 1), time + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.95);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(out);

          osc.start(time);
          osc.stop(time + 1.0);
        });
      },

      illegal(ctx, out, time) {
        // Digitized error glitch warp
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.linearRampToValueAtTime(90, time + 0.08);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
        osc.connect(gain);
        gain.connect(out);
        osc.start(time);
        osc.stop(time + 0.1);
      }
    }
  };


  // =========================================================================
  // PUBLIC CONTROLLER API
  // =========================================================================

  /**
   * Plays the designated sound event using the active sound theme
   * @param {string} event - 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'game_end' | 'illegal'
   * @param {string} [themeOverride] - optional theme override
   */
  function play(event, themeOverride) {
    if (isMutedState || currentVolume <= 0) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const themeName = themeOverride || currentTheme;
      const themeHandler = themes[themeName] || themes['wood'];
      const eventHandler = themeHandler[event] || themeHandler['move'];

      if (eventHandler) {
        const time = ctx.currentTime;
        eventHandler(ctx, masterGain, time);
      }
    } catch (err) {
      console.warn('ChessAudio playback error:', err);
    }
  }

  /**
   * Sets the master volume (0.0 to 1.0)
   * @param {number} val
   */
  function setVolume(val) {
    currentVolume = Math.max(0, Math.min(1, parseFloat(val) || 0));
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMutedState ? 0 : currentVolume, audioCtx.currentTime);
    }
  }

  /**
   * Gets current master volume
   * @returns {number}
   */
  function getVolume() {
    return currentVolume;
  }

  /**
   * Sets the active sound theme ('wood', 'modern', 'arcade', 'synth')
   * @param {string} theme
   */
  function setSoundTheme(theme) {
    if (soundThemes.includes(theme)) {
      currentTheme = theme;
    }
  }

  /**
   * Gets current active sound theme
   * @returns {string}
   */
  function getSoundTheme() {
    return currentTheme;
  }

  /**
   * Toggles mute state
   * @returns {boolean} New mute state
   */
  function toggleMute() {
    isMutedState = !isMutedState;
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMutedState ? 0 : currentVolume, audioCtx.currentTime);
    }
    return isMutedState;
  }

  /**
   * Returns whether audio is currently muted
   * @returns {boolean}
   */
  function isMuted() {
    return isMutedState;
  }

  /**
   * Manually initializes and un-suspends AudioContext
   */
  function init() {
    getAudioContext();
  }

  const ChessAudio = {
    play: play,
    setVolume: setVolume,
    getVolume: getVolume,
    setSoundTheme: setSoundTheme,
    getSoundTheme: getSoundTheme,
    soundThemes: soundThemes,
    toggleMute: toggleMute,
    isMuted: isMuted,
    init: init
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAudio;
  }
  global.ChessAudio = ChessAudio;

})(typeof window !== 'undefined' ? window : this);
