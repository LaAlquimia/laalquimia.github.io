# ♟️ AlquiChess (Ultra Responsive & Modern Web Chess)

**AlquiChess** es una plataforma moderna, fluida y de alto rendimiento para jugar al ajedrez en la web. Cuenta con multijugador online **Peer-to-Peer (WebRTC)** sin servidores intermedios, motor de **IA Stockfish**, modo **Cara a Cara / Mesa** para tablets y móviles, sintetizador de audio procedural táctil y múltiples temas visuales vectoriales.

Diseñado *mobile-first* con **100% de ancho de pantalla** en smartphones verticales, sin dependencias externas pesadas y con los más altos estándares web modernos.

---

## 🚀 Juega Ahora / Live Demo

- 🌐 **AlquiChess Principal (Online P2P, IA Stockfish & Modo Mesa):** **[https://laalquimia.github.io/chess/](https://laalquimia.github.io/chess/)**
- ⚔️ **Modo 2 Jugadores Local / Pass & Play:** **[https://laalquimia.github.io/chess/pvp.html](https://laalquimia.github.io/chess/pvp.html)**

---

## 🌟 Modos de Juego

1. **🌐 Multijugador Online P2P (WebRTC & PeerJS):**
   - Crea salas privadas con códigos de 4 letras (ej. `K7A9`) o comparte el enlace directo / código QR.
   - Sincronización de jugadas instantánea (< 20ms de latencia) mediante RTCDataChannel.
   - Ofertas de tablas (🤝), solicitudes de revancha y abandono de partida.
   - Barra flotante de reacciones con emojis en vivo (👏, 🔥, 😮, ♟️, 👑, 💀, 😂, 🤝).

2. **🤖 Partida contra Stockfish AI:**
   - 6 niveles de dificultad (*Principiante, Fácil, Medio, Difícil, Experto, Máximo*).
   - Barra de evaluación posicional en tiempo real.
   - Cálculo en segundo plano vía Web Worker para no congelar la interfaz.

3. **👥 Modo Mesa / Cara a Cara (Tabletop):**
   - Ideal para colocar el móvil o tablet sobre la mesa entre dos personas.
   - Rota automáticamente las fichas del rival 180° para que ambos jugadores las vean en su orientación correcta.

---

## 🎨 Personalización y Temas

- **Estilos de Tablero:**
  - 🌿 **Verde:** Estilo clásico internacional (Chess.com / Lichess)
  - 🪵 **Madera:** Tonos cálidos de nogal y arce
  - 🌑 **Oscuro:** Modo oscuro elegante en carbón y pizarra
  - 🌊 **Azul:** Pizarra oceánica suave
  - ⚡ **Cyber:** Neón cyberpunk con iluminación brillante
  - 🪸 **Coral:** Tonos cálidos de coral y arena

- **Sets de Piezas Vectoriales (SVG):**
  - **Standard (Staunton / Cburnett):** Vectores nítidos con Rey estilizado y proporciones nobles
  - **Modern:** Siluetas geométricas minimalistas
  - **Wood:** Piezas texturizadas en madera cálida
  - **Neon:** Trazos luminosos futuristas

- **Sintetizador de Sonido Procedural (Web Audio API):**
  - 100% offline sin descargar archivos de audio externos.
  - Efectos para movimientos, capturas, jaque, enroque, coronación y fin de partida.
  - 4 paquetes acústicos: *Madera Realista, Moderno Acústico, Arcade 8-Bit y Sintetizador Sci-Fi*.

---

## ⌨️ Atajos de Teclado

| Tecla | Acción |
| :--- | :--- |
| <kbd>F</kbd> | Girar orientación del tablero (Vista Blancas / Negras) |
| <kbd>Z</kbd> | Deshacer última jugada (Undo) |
| <kbd>R</kbd> | Reiniciar / Nueva partida |
| <kbd>M</kbd> | Silenciar / Activar sonido |
| <kbd>S</kbd> | Abrir panel de Ajustes |
| <kbd>Esc</kbd> | Cerrar ventanas modales abiertas |

---

## 📂 Arquitectura del Proyecto

```text
chess-html/
├── index.html              # Entrada principal de AlquiChess (Online, IA y Modo Mesa)
├── pvp.html                # Vista directa para 2 Jugadores Local
├── css/
│   └── style.css           # Estilos responsivos mobile-first, temas y modales
├── js/
│   ├── app.js              # Controlador maestro de UI, eventos y estados
│   ├── peer-chess.js       # Cliente WebRTC P2P (PeerJS, salas y protocolo)
│   ├── audio.js            # Motor de sonido procedural con Web Audio API
│   ├── chess-core.js       # Motor de reglas de ajedrez (FEN, SAN, validaciones)
│   ├── pieces.js           # Vectores SVG escalables de piezas
│   ├── stockfish-bridge.js # Puente Web Worker para motor Stockfish
│   ├── peerjs.min.js       # Biblioteca PeerJS WebRTC
│   └── qrcode.min.js       # Generador de códigos QR para salas
├── tests/
│   ├── test-chess-core.js  # Pruebas unitarias del motor de reglas
│   ├── test-stockfish-bridge.js # Pruebas del puente de IA
│   ├── test-app-interactions.js # Pruebas de movimiento e interacciones
│   ├── test-pieces.js      # Pruebas de renderizado y silueta SVG
│   └── test-peer-protocol.js # Pruebas del protocolo WebRTC P2P
├── stockfish.js            # Web Worker del motor Stockfish
├── stockfish.wasm          # Binario WebAssembly de Stockfish
└── stockfish.wasm.js       # Cargador WASM
```

---

## 🧪 Pruebas Unitarias

Para ejecutar la suite completa de pruebas automatizadas:

```bash
node tests/test-chess-core.js && node tests/test-stockfish-bridge.js && node tests/test-app-interactions.js && node tests/test-pieces.js && node tests/test-peer-protocol.js
```

---

## 📦 Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0 (GPL-3.0)**.  
El motor Stockfish integrado también posee licencia GPL.  
Eres libre de usar, modificar y redistribuir bajo los mismos términos.

---

## ❤️ Créditos

Desarrollado con 🧠 + ♟️ por **[La Alquimia](https://laalquimia.github.io)** & [Stockfish Engine](https://stockfishchess.org).
  
