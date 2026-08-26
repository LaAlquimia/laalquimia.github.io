/**
 * ChessPieces - Vector SVG Piece Definitions for Chess
 * Supports 4 distinct themes: 'standard', 'modern', 'wood', 'neon'
 * All pieces are crisp vector SVGs with viewBox="0 0 45 45"
 *
 * Supported pieces:
 *   White: 'P', 'R', 'N', 'B', 'Q', 'K'
 *   Black: 'p', 'r', 'n', 'b', 'q', 'k'
 */

(function (global) {
  'use strict';

  // ==========================================
  // 1. STANDARD THEME (Cburnett vectors)
  // ==========================================
  const standardPieces = {
    // White Pawn
    'P': `<path d="M 22.5,9 C 20.29,9 18.5,10.79 18.5,13 C 18.5,13.89 18.79,14.71 19.28,15.38 C 17.33,16.5 16,18.59 16,21 C 16,23.03 16.94,24.84 18.41,26.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 C 28.06,24.84 29,23.03 29,21 C 29,18.59 27.67,16.5 25.72,15.38 C 26.21,14.71 26.5,13.89 26.5,13 C 26.5,10.79 24.71,9 22.5,9 z" fill="#ffffff" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

    // Black Pawn
    'p': `<path d="M 22.5,9 C 20.29,9 18.5,10.79 18.5,13 C 18.5,13.89 18.79,14.71 19.28,15.38 C 17.33,16.5 16,18.59 16,21 C 16,23.03 16.94,24.84 18.41,26.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 C 28.06,24.84 29,23.03 29,21 C 29,18.59 27.67,16.5 25.72,15.38 C 26.21,14.71 26.5,13.89 26.5,13 C 26.5,10.79 24.71,9 22.5,9 z" fill="#1e1e1e" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`,

    // White Knight
    'N': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#ffffff"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 17.5,7 C 17.5,7 18.5,9 22,10 z" fill="#ffffff"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#000000"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#000000"/>
    </g>`,

    // Black Knight
    'n': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="#1e1e1e"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 17.5,7 C 17.5,7 18.5,9 22,10 z" fill="#1e1e1e"/>
      <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#ececec"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#ececec"/>
      <path d="M 24.55,10.4 C 24.55,10.4 24.8,11.2 24.3,12.2 C 23.8,13.2 23.3,13.7 23.3,13.7" stroke="#ececec" fill="none"/>
    </g>`,

    // White Bishop
    'B': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#ffffff" stroke-linecap="butt">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 12,36 C 14.5,33.5 15.5,32 17,25 C 18,20 18,17 18,17 C 18,17 16,14.5 16,11.5 C 16,8.5 18.5,6 22.5,6 C 26.5,6 29,8.5 29,11.5 C 29,14.5 27,17 27,17 C 27,17 27,20 28,25 C 29.5,32 30.5,33.5 33,36 L 12,36 z"/>
        <path d="M 22.5,9 C 21.5,9 21,9.5 21,10.5 C 21,11.5 21.5,12 22.5,12 C 23.5,12 24,11.5 24,10.5 C 24,9.5 23.5,9 22.5,9 z"/>
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" stroke="#000000" stroke-linejoin="miter"/>
    </g>`,

    // Black Bishop
    'b': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#1e1e1e" stroke-linecap="butt">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 12,36 C 14.5,33.5 15.5,32 17,25 C 18,20 18,17 18,17 C 18,17 16,14.5 16,11.5 C 16,8.5 18.5,6 22.5,6 C 26.5,6 29,8.5 29,11.5 C 29,14.5 27,17 27,17 C 27,17 27,20 28,25 C 29.5,32 30.5,33.5 33,36 L 12,36 z"/>
        <path d="M 22.5,9 C 21.5,9 21,9.5 21,10.5 C 21,11.5 21.5,12 22.5,12 C 23.5,12 24,11.5 24,10.5 C 24,9.5 23.5,9 22.5,9 z"/>
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" stroke="#ececec" stroke-linejoin="miter"/>
    </g>`,

    // White Rook
    'R': `<g fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" stroke-linecap="butt"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" stroke-linecap="butt"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" stroke-linecap="butt"/>
      <path d="M 34,14 L 31,17 L 14,17 L 11,14"/>
      <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/>
      <path d="M 11,14 L 34,14" fill="none" stroke="#000000" stroke-linejoin="miter"/>
    </g>`,

    // Black Rook
    'r': `<g fill="#1e1e1e" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" stroke-linecap="butt"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" stroke-linecap="butt"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" stroke-linecap="butt"/>
      <path d="M 34,14 L 31,17 L 14,17 L 11,14"/>
      <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/>
      <path d="M 12,35.5 L 33,35.5 M 13.5,31.5 L 31.5,31.5 M 14,29.5 L 31,29.5 M 14,16.5 L 31,16.5 M 11,14 L 34,14" fill="none" stroke="#ececec" stroke-linejoin="miter"/>
    </g>`,

    // White Queen
    'Q': `<g fill="#ffffff" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"/>
      <path d="M 24.5 7.5 A 2 2 0 1 1 20.5,7.5 A 2 2 0 1 1 24.5 7.5 z"/>
      <path d="M 41 12 A 2 2 0 1 1 37,12 A 2 2 0 1 1 41 12 z"/>
      <path d="M 16 8.5 A 2 2 0 1 1 12,8.5 A 2 2 0 1 1 16 8.5 z"/>
      <path d="M 33 8.5 A 2 2 0 1 1 29,8.5 A 2 2 0 1 1 33 8.5 z"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z" stroke-linecap="butt"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" stroke-linecap="butt"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none"/>
    </g>`,

    // Black Queen
    'q': `<g fill="#1e1e1e" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 8 12 A 2 2 0 1 1 4,12 A 2 2 0 1 1 8 12 z"/>
      <path d="M 24.5 7.5 A 2 2 0 1 1 20.5,7.5 A 2 2 0 1 1 24.5 7.5 z"/>
      <path d="M 41 12 A 2 2 0 1 1 37,12 A 2 2 0 1 1 41 12 z"/>
      <path d="M 16 8.5 A 2 2 0 1 1 12,8.5 A 2 2 0 1 1 16 8.5 z"/>
      <path d="M 33 8.5 A 2 2 0 1 1 29,8.5 A 2 2 0 1 1 33 8.5 z"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z" stroke-linecap="butt"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" stroke-linecap="butt"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5 M 10.5,36 C 16.5,35 28.5,35 34.5,36" fill="none" stroke="#ececec"/>
    </g>`,

    // White King
    'K': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" stroke-linejoin="miter"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z" fill="#ffffff" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 36.5,28.5 36.5,28.5 C 36.5,28.5 38.5,24 35.5,18.5 C 32.5,13 29.5,14.5 29.5,14.5 C 29.5,14.5 28,11.5 22.5,11.5 C 17,11.5 15.5,14.5 15.5,14.5 C 15.5,14.5 12.5,13 9.5,18.5 C 6.5,24 8.5,28.5 8.5,28.5 C 8.5,28.5 8.5,34 11.5,37 z" fill="#ffffff"/>
      <path d="M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5 M 11.5,37 C 17,34 28,34 33.5,37"/>
    </g>`,

    // Black King
    'k': `<g fill="none" fill-rule="evenodd" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" stroke-linejoin="miter"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z" fill="#1e1e1e" stroke-linecap="butt" stroke-linejoin="miter"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 36.5,28.5 36.5,28.5 C 36.5,28.5 38.5,24 35.5,18.5 C 32.5,13 29.5,14.5 29.5,14.5 C 29.5,14.5 28,11.5 22.5,11.5 C 17,11.5 15.5,14.5 15.5,14.5 C 15.5,14.5 12.5,13 9.5,18.5 C 6.5,24 8.5,28.5 8.5,28.5 C 8.5,28.5 8.5,34 11.5,37 z" fill="#1e1e1e"/>
      <path d="M 20,8 L 25,8 M 22.5,6 L 22.5,11.63 M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5 M 11.5,37 C 17,34 28,34 33.5,37" stroke="#ececec"/>
    </g>`
  };


  // ==========================================
  // 2. MODERN THEME (Geometric Sleek Minimalist)
  // ==========================================
  const modernDefs = `
    <defs>
      <linearGradient id="mod-w-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <linearGradient id="mod-b-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <filter id="mod-shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1" flood-opacity="0.2"/>
      </filter>
    </defs>
  `;

  const modernPieces = {
    // White Pawn
    'P': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="22.5" cy="13" r="5" fill="url(#mod-w-grad)"/>
      <path d="M 16,38 L 19,23 L 26,23 L 29,38 Z" fill="url(#mod-w-grad)"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-w-grad)"/>
      <line x1="18.5" y1="23" x2="26.5" y2="23" stroke="#cbd5e1" stroke-width="1.2"/>
    </g>`,

    // Black Pawn
    'p': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="22.5" cy="13" r="5" fill="url(#mod-b-grad)"/>
      <path d="M 16,38 L 19,23 L 26,23 L 29,38 Z" fill="url(#mod-b-grad)"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-b-grad)"/>
      <line x1="18.5" y1="23" x2="26.5" y2="23" stroke="#64748b" stroke-width="1.2"/>
    </g>`,

    // White Knight
    'N': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 15,38 L 12,28 L 8,24 L 11,20 L 15,22 L 18,11 L 27,9 L 33,14 L 32,23 L 29,38 Z" fill="url(#mod-w-grad)"/>
      <polygon points="17,17 21,15 22,19" fill="#1e293b"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-w-grad)"/>
      <path d="M 23,12 L 28,19 L 28,32" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
    </g>`,

    // Black Knight
    'n': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 15,38 L 12,28 L 8,24 L 11,20 L 15,22 L 18,11 L 27,9 L 33,14 L 32,23 L 29,38 Z" fill="url(#mod-b-grad)"/>
      <polygon points="17,17 21,15 22,19" fill="#f8fafc"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-b-grad)"/>
      <path d="M 23,12 L 28,19 L 28,32" fill="none" stroke="#64748b" stroke-width="1.2"/>
    </g>`,

    // White Bishop
    'B': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="22.5" cy="8" r="2.5" fill="url(#mod-w-grad)"/>
      <path d="M 22.5,12 C 16,12 15,19 16,25 L 14,38 L 31,38 L 29,25 C 30,19 29,12 22.5,12 Z" fill="url(#mod-w-grad)"/>
      <path d="M 20,16 L 27,23" fill="none" stroke="#1e293b" stroke-width="1.8"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-w-grad)"/>
    </g>`,

    // Black Bishop
    'b': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="22.5" cy="8" r="2.5" fill="url(#mod-b-grad)"/>
      <path d="M 22.5,12 C 16,12 15,19 16,25 L 14,38 L 31,38 L 29,25 C 30,19 29,12 22.5,12 Z" fill="url(#mod-b-grad)"/>
      <path d="M 20,16 L 27,23" fill="none" stroke="#f8fafc" stroke-width="1.8"/>
      <path d="M 12,38 L 33,38 L 31,41 L 14,41 Z" fill="url(#mod-b-grad)"/>
    </g>`,

    // White Rook
    'R': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 13,11 L 13,17 L 16,17 L 16,14 L 20,14 L 20,17 L 25,17 L 25,14 L 29,14 L 29,17 L 32,17 L 32,11 Z" fill="url(#mod-w-grad)"/>
      <path d="M 15,17 L 16,38 L 29,38 L 30,17 Z" fill="url(#mod-w-grad)"/>
      <path d="M 11,38 L 34,38 L 32,41 L 13,41 Z" fill="url(#mod-w-grad)"/>
      <line x1="17" y1="24" x2="28" y2="24" stroke="#94a3b8" stroke-width="1.2"/>
    </g>`,

    // Black Rook
    'r': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 13,11 L 13,17 L 16,17 L 16,14 L 20,14 L 20,17 L 25,17 L 25,14 L 29,14 L 29,17 L 32,17 L 32,11 Z" fill="url(#mod-b-grad)"/>
      <path d="M 15,17 L 16,38 L 29,38 L 30,17 Z" fill="url(#mod-b-grad)"/>
      <path d="M 11,38 L 34,38 L 32,41 L 13,41 Z" fill="url(#mod-b-grad)"/>
      <line x1="17" y1="24" x2="28" y2="24" stroke="#64748b" stroke-width="1.2"/>
    </g>`,

    // White Queen
    'Q': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="10" cy="12" r="1.8" fill="url(#mod-w-grad)"/>
      <circle cx="16.5" cy="9.5" r="1.8" fill="url(#mod-w-grad)"/>
      <circle cx="22.5" cy="8" r="2.2" fill="url(#mod-w-grad)"/>
      <circle cx="28.5" cy="9.5" r="1.8" fill="url(#mod-w-grad)"/>
      <circle cx="35" cy="12" r="1.8" fill="url(#mod-w-grad)"/>
      <path d="M 10,14 L 14,27 L 18,17 L 22.5,25 L 27,17 L 31,27 L 35,14 L 32,38 L 13,38 Z" fill="url(#mod-w-grad)"/>
      <path d="M 11,38 L 34,38 L 32,41 L 13,41 Z" fill="url(#mod-w-grad)"/>
      <circle cx="22.5" cy="31" r="2.5" fill="#1e293b"/>
    </g>`,

    // Black Queen
    'q': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="10" cy="12" r="1.8" fill="url(#mod-b-grad)"/>
      <circle cx="16.5" cy="9.5" r="1.8" fill="url(#mod-b-grad)"/>
      <circle cx="22.5" cy="8" r="2.2" fill="url(#mod-b-grad)"/>
      <circle cx="28.5" cy="9.5" r="1.8" fill="url(#mod-b-grad)"/>
      <circle cx="35" cy="12" r="1.8" fill="url(#mod-b-grad)"/>
      <path d="M 10,14 L 14,27 L 18,17 L 22.5,25 L 27,17 L 31,27 L 35,14 L 32,38 L 13,38 Z" fill="url(#mod-b-grad)"/>
      <path d="M 11,38 L 34,38 L 32,41 L 13,41 Z" fill="url(#mod-b-grad)"/>
      <circle cx="22.5" cy="31" r="2.5" fill="#f8fafc"/>
    </g>`,

    // White King
    'K': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 22.5,5 L 22.5,12 M 19,8.5 L 26,8.5" stroke="#1e293b" stroke-width="2"/>
      <path d="M 12,17 L 22.5,14 L 33,17 L 31,38 L 14,38 Z" fill="url(#mod-w-grad)"/>
      <path d="M 10,38 L 35,38 L 33,41 L 12,41 Z" fill="url(#mod-w-grad)"/>
      <polygon points="22.5,20 27,28 18,28" fill="#1e293b"/>
    </g>`,

    // Black King
    'k': `${modernDefs}
    <g filter="url(#mod-shadow)" stroke="#0f172a" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round">
      <path d="M 22.5,5 L 22.5,12 M 19,8.5 L 26,8.5" stroke="#f8fafc" stroke-width="2"/>
      <path d="M 12,17 L 22.5,14 L 33,17 L 31,38 L 14,38 Z" fill="url(#mod-b-grad)"/>
      <path d="M 10,38 L 35,38 L 33,41 L 12,41 Z" fill="url(#mod-b-grad)"/>
      <polygon points="22.5,20 27,28 18,28" fill="#f8fafc"/>
    </g>`
  };


  // ==========================================
  // 3. WOOD THEME (Warm Carved Handcrafted Timber)
  // ==========================================
  const woodDefs = `
    <defs>
      <linearGradient id="wood-w-grad" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#fffbeb"/>
        <stop offset="30%" stop-color="#fef3c7"/>
        <stop offset="70%" stop-color="#fde68a"/>
        <stop offset="100%" stop-color="#d97706"/>
      </linearGradient>
      <linearGradient id="wood-b-grad" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#78350f"/>
        <stop offset="40%" stop-color="#451a03"/>
        <stop offset="85%" stop-color="#290e03"/>
        <stop offset="100%" stop-color="#170601"/>
      </linearGradient>
      <filter id="wood-relief" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0.5" dy="1.5" stdDeviation="0.8" flood-color="#000" flood-opacity="0.35"/>
      </filter>
    </defs>
  `;

  const woodPieces = {
    // White Pawn
    'P': `${woodDefs}
    <g filter="url(#wood-relief)">
      <path d="M 22.5,9 C 20.29,9 18.5,10.79 18.5,13 C 18.5,13.89 18.79,14.71 19.28,15.38 C 17.33,16.5 16,18.59 16,21 C 16,23.03 16.94,24.84 18.41,26.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 C 28.06,24.84 29,23.03 29,21 C 29,18.59 27.67,16.5 25.72,15.38 C 26.21,14.71 26.5,13.89 26.5,13 C 26.5,10.79 24.71,9 22.5,9 z" fill="url(#wood-w-grad)" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 13,38 C 18,36.5 27,36.5 32,38" fill="none" stroke="#b45309" stroke-width="1.2"/>
    </g>`,

    // Black Pawn
    'p': `${woodDefs}
    <g filter="url(#wood-relief)">
      <path d="M 22.5,9 C 20.29,9 18.5,10.79 18.5,13 C 18.5,13.89 18.79,14.71 19.28,15.38 C 17.33,16.5 16,18.59 16,21 C 16,23.03 16.94,24.84 18.41,26.03 C 15.41,27.09 11,31.58 11,39.5 L 34,39.5 C 34,31.58 29.59,27.09 26.59,26.03 C 28.06,24.84 29,23.03 29,21 C 29,18.59 27.67,16.5 25.72,15.38 C 26.21,14.71 26.5,13.89 26.5,13 C 26.5,10.79 24.71,9 22.5,9 z" fill="url(#wood-b-grad)" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M 13,38 C 18,36.5 27,36.5 32,38" fill="none" stroke="#9a3412" stroke-width="1.2"/>
    </g>`,

    // White Knight
    'N': `${woodDefs}
    <g filter="url(#wood-relief)" fill="none" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="url(#wood-w-grad)"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 17.5,7 C 17.5,7 18.5,9 22,10 z" fill="url(#wood-w-grad)"/>
      <circle cx="9.5" cy="25.5" r="1" fill="#78350f" stroke="none"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#78350f"/>
      <path d="M 23,12 C 24.5,14 26,19 25,26" stroke="#b45309" stroke-width="1.2"/>
    </g>`,

    // Black Knight
    'n': `${woodDefs}
    <g filter="url(#wood-relief)" fill="none" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" fill="url(#wood-b-grad)"/>
      <path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 17.5,7 C 17.5,7 18.5,9 22,10 z" fill="url(#wood-b-grad)"/>
      <circle cx="9.5" cy="25.5" r="1" fill="#fde68a" stroke="none"/>
      <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#fde68a"/>
      <path d="M 24.55,10.4 C 24.55,10.4 24.8,11.2 24.3,12.2 C 23.8,13.2 23.3,13.7 23.3,13.7" stroke="#9a3412"/>
    </g>`,

    // White Bishop
    'B': `${woodDefs}
    <g filter="url(#wood-relief)" fill="none" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="url(#wood-w-grad)" stroke-linecap="butt">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 12,36 C 14.5,33.5 15.5,32 17,25 C 18,20 18,17 18,17 C 18,17 16,14.5 16,11.5 C 16,8.5 18.5,6 22.5,6 C 26.5,6 29,8.5 29,11.5 C 29,14.5 27,17 27,17 C 27,17 27,20 28,25 C 29.5,32 30.5,33.5 33,36 L 12,36 z"/>
        <circle cx="22.5" cy="10.5" r="1.5"/>
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" stroke="#78350f"/>
    </g>`,

    // Black Bishop
    'b': `${woodDefs}
    <g filter="url(#wood-relief)" fill="none" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <g fill="url(#wood-b-grad)" stroke-linecap="butt">
        <path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.96 22.5,37.5 C 19.11,38.96 12.39,37.53 9,38.5 C 7.646,38.99 6.677,38.97 6,38 C 7.354,36.54 9,36 9,36 z"/>
        <path d="M 12,36 C 14.5,33.5 15.5,32 17,25 C 18,20 18,17 18,17 C 18,17 16,14.5 16,11.5 C 16,8.5 18.5,6 22.5,6 C 26.5,6 29,8.5 29,11.5 C 29,14.5 27,17 27,17 C 27,17 27,20 28,25 C 29.5,32 30.5,33.5 33,36 L 12,36 z"/>
        <circle cx="22.5" cy="10.5" r="1.5"/>
      </g>
      <path d="M 17.5,26 L 27.5,26 M 15,30 L 30,30 M 22.5,15.5 L 22.5,20.5 M 20,18 L 25,18" stroke="#d97706"/>
    </g>`,

    // White Rook
    'R': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-w-grad)" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/>
      <path d="M 34,14 L 31,17 L 14,17 L 11,14"/>
      <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/>
      <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/>
      <line x1="11" y1="14" x2="34" y2="14" stroke="#78350f"/>
    </g>`,

    // Black Rook
    'r': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-b-grad)" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 9,39 L 36,39 L 36,36 L 9,36 Z"/>
      <path d="M 12,36 L 12,32 L 33,32 L 33,36 Z"/>
      <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14"/>
      <path d="M 34,14 L 31,17 L 14,17 L 11,14"/>
      <path d="M 31,17 L 31,29.5 L 14,29.5 L 14,17"/>
      <path d="M 31,29.5 L 32.5,32 L 12.5,32 L 14,29.5"/>
      <path d="M 12,35.5 L 33,35.5 M 14,29.5 L 31,29.5 M 14,16.5 L 31,16.5" stroke="#9a3412" stroke-width="1.2"/>
    </g>`,

    // White Queen
    'Q': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-w-grad)" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2"/>
      <circle cx="22.5" cy="7.5" r="2"/>
      <circle cx="39" cy="12" r="2"/>
      <circle cx="14" cy="8.5" r="2"/>
      <circle cx="31" cy="8.5" r="2"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5" fill="none" stroke="#b45309" stroke-width="1.2"/>
    </g>`,

    // Black Queen
    'q': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-b-grad)" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="12" r="2"/>
      <circle cx="22.5" cy="7.5" r="2"/>
      <circle cx="39" cy="12" r="2"/>
      <circle cx="14" cy="8.5" r="2"/>
      <circle cx="31" cy="8.5" r="2"/>
      <path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 31,11 L 25.5,24.5 L 22.5,10 L 19.5,24.5 L 14,11 L 14,25 L 7,14 L 9,26 z"/>
      <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 C 17.5,39.5 27.5,39.5 34,38.5 C 34,38.5 36,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 Z"/>
      <path d="M 11.5,30 C 15,29 30,29 33.5,30 M 12,33.5 C 18,32.5 27,32.5 33,33.5 M 10.5,36 C 16.5,35 28.5,35 34.5,36" fill="none" stroke="#d97706" stroke-width="1.2"/>
    </g>`,

    // White King
    'K': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-w-grad)" stroke="#78350f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" fill="none" stroke-width="2"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 36.5,28.5 36.5,28.5 C 36.5,28.5 38.5,24 35.5,18.5 C 32.5,13 29.5,14.5 29.5,14.5 C 29.5,14.5 28,11.5 22.5,11.5 C 17,11.5 15.5,14.5 15.5,14.5 C 15.5,14.5 12.5,13 9.5,18.5 C 6.5,24 8.5,28.5 8.5,28.5 C 8.5,28.5 8.5,34 11.5,37 z"/>
      <path d="M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5 M 11.5,37 C 17,34 28,34 33.5,37" fill="none" stroke="#b45309" stroke-width="1.2"/>
    </g>`,

    // Black King
    'k': `${woodDefs}
    <g filter="url(#wood-relief)" fill="url(#wood-b-grad)" stroke="#1a0601" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22.5,11.63 L 22.5,6 M 20,8 L 25,8" fill="none" stroke="#d97706" stroke-width="2"/>
      <path d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z"/>
      <path d="M 11.5,37 C 17,40.5 28,40.5 33.5,37 C 36.5,34 36.5,28.5 36.5,28.5 C 36.5,28.5 38.5,24 35.5,18.5 C 32.5,13 29.5,14.5 29.5,14.5 C 29.5,14.5 28,11.5 22.5,11.5 C 17,11.5 15.5,14.5 15.5,14.5 C 15.5,14.5 12.5,13 9.5,18.5 C 6.5,24 8.5,28.5 8.5,28.5 C 8.5,28.5 8.5,34 11.5,37 z"/>
      <path d="M 11.5,30 C 17,27 28,27 33.5,30 M 11.5,33.5 C 17,30.5 28,30.5 33.5,33.5 M 11.5,37 C 17,34 28,34 33.5,37" fill="none" stroke="#9a3412" stroke-width="1.2"/>
    </g>`
  };


  // ==========================================
  // 4. NEON THEME (Cyberpunk Glowing Vectors)
  // ==========================================
  const neonDefs = `
    <defs>
      <filter id="neon-glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="neon-glow-pink" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;

  const neonPieces = {
    // White Pawn (Cyber Cyan)
    'P': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="13" r="4.5" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <path d="M 16,38 L 19,23 L 26,23 L 29,38 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <circle cx="22.5" cy="13" r="1.5" fill="#e0f7fa"/>
      <line x1="22.5" y1="23" x2="22.5" y2="35" stroke="#38bdf8" stroke-width="1.2"/>
    </g>`,

    // Black Pawn (Cyber Pink/Magenta)
    'p': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="13" r="4.5" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <path d="M 16,38 L 19,23 L 26,23 L 29,38 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#ff007f" stroke-width="2"/>
      <circle cx="22.5" cy="13" r="1.5" fill="#fce7f3"/>
      <line x1="22.5" y1="23" x2="22.5" y2="35" stroke="#f472b6" stroke-width="1.2"/>
    </g>`,

    // White Knight (Cyber Cyan)
    'N': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 15,38 L 12,28 L 8,24 L 11,20 L 15,22 L 18,11 L 27,9 L 33,14 L 32,23 L 29,38 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <polygon points="17,17 20,15 21,18" fill="#e0f7fa"/>
      <path d="M 23,12 L 28,18 L 27,33" fill="none" stroke="#38bdf8" stroke-width="1.3"/>
    </g>`,

    // Black Knight (Cyber Pink/Magenta)
    'n': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 15,38 L 12,28 L 8,24 L 11,20 L 15,22 L 18,11 L 27,9 L 33,14 L 32,23 L 29,38 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#ff007f" stroke-width="2"/>
      <polygon points="17,17 20,15 21,18" fill="#fce7f3"/>
      <path d="M 23,12 L 28,18 L 27,33" fill="none" stroke="#f472b6" stroke-width="1.3"/>
    </g>`,

    // White Bishop (Cyber Cyan)
    'B': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="8" r="2.5" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <path d="M 22.5,12 C 16,12 15,19 16,25 L 14,38 L 31,38 L 29,25 C 30,19 29,12 22.5,12 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="19" y1="16" x2="26" y2="23" stroke="#e0f7fa" stroke-width="2"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <line x1="22.5" y1="26" x2="22.5" y2="35" stroke="#38bdf8" stroke-width="1.3"/>
    </g>`,

    // Black Bishop (Cyber Pink/Magenta)
    'b': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="22.5" cy="8" r="2.5" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <path d="M 22.5,12 C 16,12 15,19 16,25 L 14,38 L 31,38 L 29,25 C 30,19 29,12 22.5,12 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="19" y1="16" x2="26" y2="23" stroke="#fce7f3" stroke-width="2"/>
      <line x1="12" y1="38" x2="33" y2="38" stroke="#ff007f" stroke-width="2"/>
      <line x1="22.5" y1="26" x2="22.5" y2="35" stroke="#f472b6" stroke-width="1.3"/>
    </g>`,

    // White Rook (Cyber Cyan)
    'R': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 13,11 L 13,17 L 16,17 L 16,14 L 20,14 L 20,17 L 25,17 L 25,14 L 29,14 L 29,17 L 32,17 L 32,11 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <path d="M 15,17 L 16,38 L 29,38 L 30,17 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="11" y1="38" x2="34" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <line x1="16" y1="27" x2="29" y2="27" stroke="#38bdf8" stroke-width="1.4"/>
      <circle cx="22.5" cy="21" r="1.8" fill="#e0f7fa"/>
    </g>`,

    // Black Rook (Cyber Pink/Magenta)
    'r': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 13,11 L 13,17 L 16,17 L 16,14 L 20,14 L 20,17 L 25,17 L 25,14 L 29,14 L 29,17 L 32,17 L 32,11 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <path d="M 15,17 L 16,38 L 29,38 L 30,17 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="11" y1="38" x2="34" y2="38" stroke="#ff007f" stroke-width="2"/>
      <line x1="16" y1="27" x2="29" y2="27" stroke="#f472b6" stroke-width="1.4"/>
      <circle cx="22.5" cy="21" r="1.8" fill="#fce7f3"/>
    </g>`,

    // White Queen (Cyber Cyan)
    'Q': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="12" r="1.8" fill="#00f0ff"/>
      <circle cx="16.5" cy="9.5" r="1.8" fill="#00f0ff"/>
      <circle cx="22.5" cy="8" r="2.2" fill="#e0f7fa"/>
      <circle cx="28.5" cy="9.5" r="1.8" fill="#00f0ff"/>
      <circle cx="35" cy="12" r="1.8" fill="#00f0ff"/>
      <path d="M 10,14 L 14,27 L 18,17 L 22.5,25 L 27,17 L 31,27 L 35,14 L 32,38 L 13,38 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="11" y1="38" x2="34" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <polygon points="22.5,28 25,33 20,33" fill="#e0f7fa"/>
    </g>`,

    // Black Queen (Cyber Pink/Magenta)
    'q': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="10" cy="12" r="1.8" fill="#ff007f"/>
      <circle cx="16.5" cy="9.5" r="1.8" fill="#ff007f"/>
      <circle cx="22.5" cy="8" r="2.2" fill="#fce7f3"/>
      <circle cx="28.5" cy="9.5" r="1.8" fill="#ff007f"/>
      <circle cx="35" cy="12" r="1.8" fill="#ff007f"/>
      <path d="M 10,14 L 14,27 L 18,17 L 22.5,25 L 27,17 L 31,27 L 35,14 L 32,38 L 13,38 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="11" y1="38" x2="34" y2="38" stroke="#ff007f" stroke-width="2"/>
      <polygon points="22.5,28 25,33 20,33" fill="#fce7f3"/>
    </g>`,

    // White King (Cyber Cyan)
    'K': `${neonDefs}
    <g filter="url(#neon-glow-cyan)" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22.5" y1="5" x2="22.5" y2="12" stroke="#e0f7fa" stroke-width="2.2"/>
      <line x1="19" y1="8" x2="26" y2="8" stroke="#e0f7fa" stroke-width="2.2"/>
      <path d="M 12,17 L 22.5,14 L 33,17 L 31,38 L 14,38 Z" fill="#041d2e" stroke="#00f0ff" stroke-width="1.6"/>
      <line x1="10" y1="38" x2="35" y2="38" stroke="#00f0ff" stroke-width="2"/>
      <polygon points="22.5,19 27,27 18,27" fill="#00f0ff"/>
      <line x1="15" y1="33" x2="30" y2="33" stroke="#38bdf8" stroke-width="1.3"/>
    </g>`,

    // Black King (Cyber Pink/Magenta)
    'k': `${neonDefs}
    <g filter="url(#neon-glow-pink)" stroke-linecap="round" stroke-linejoin="round">
      <line x1="22.5" y1="5" x2="22.5" y2="12" stroke="#fce7f3" stroke-width="2.2"/>
      <line x1="19" y1="8" x2="26" y2="8" stroke="#fce7f3" stroke-width="2.2"/>
      <path d="M 12,17 L 22.5,14 L 33,17 L 31,38 L 14,38 Z" fill="#2d0520" stroke="#ff007f" stroke-width="1.6"/>
      <line x1="10" y1="38" x2="35" y2="38" stroke="#ff007f" stroke-width="2"/>
      <polygon points="22.5,19 27,27 18,27" fill="#ff007f"/>
      <line x1="15" y1="33" x2="30" y2="33" stroke="#f472b6" stroke-width="1.3"/>
    </g>`
  };


  // ==========================================
  // Registry & Public Interface
  // ==========================================
  const themes = {
    standard: standardPieces,
    modern: modernPieces,
    wood: woodPieces,
    neon: neonPieces
  };

  const styleList = ['standard', 'modern', 'wood', 'neon'];

  /**
   * Generates a complete inline SVG string for the specified piece and style
   * @param {string} pieceChar - 'P', 'R', 'N', 'B', 'Q', 'K' or 'p', 'r', 'n', 'b', 'q', 'k'
   * @param {string} style - 'standard' | 'modern' | 'wood' | 'neon'
   * @returns {string} Fully formed SVG XML string
   */
  function getPieceSVG(pieceChar, style = 'standard') {
    if (!pieceChar || typeof pieceChar !== 'string') return '';
    const char = pieceChar.trim();
    const activeStyle = (themes[style]) ? style : 'standard';
    const innerContent = themes[activeStyle][char] || themes['standard'][char];

    if (!innerContent) return '';

    const isWhite = char === char.toUpperCase();
    const colorClass = isWhite ? 'piece-white' : 'piece-black';
    const pieceType = char.toLowerCase();

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="100%" height="100%" class="chess-piece-svg piece-${pieceType} ${colorClass} style-${activeStyle}" data-piece="${char}" data-style="${activeStyle}">${innerContent}</svg>`;
  }

  /**
   * Returns a Data URL (data:image/svg+xml;utf8,...) for use in <img> tags or CSS background
   * @param {string} pieceChar
   * @param {string} style
   * @returns {string} Data URL string
   */
  function getPieceDataURL(pieceChar, style = 'standard') {
    const svg = getPieceSVG(pieceChar, style);
    if (!svg) return '';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Export to global scope
  const ChessPieces = {
    styles: styleList,
    getPieceSVG: getPieceSVG,
    getPieceDataURL: getPieceDataURL,
    themes: themes
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessPieces;
  }
  global.ChessPieces = ChessPieces;

})(typeof window !== 'undefined' ? window : this);
