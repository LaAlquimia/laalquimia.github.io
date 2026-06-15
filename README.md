# La Alquimia - Algorithmic Trading

Este es el repositorio oficial de la plataforma de trading algorítmico **La Alquimia**.

## Sistema de Diseño: Liquid Glass (Verde-Azul Orientado a Verde)

El proyecto utiliza una estética **Liquid Glass (Cristal Líquido)** premium. Por definición de marca, **la paleta de colores está orientada principalmente al color verde** (que representa crecimiento, ganancias y trading exitoso) respaldada por sutiles acentos **azulados y cianes** (que representan tecnología, fluidez y liquidez).

### Paleta de Colores Detallada

*   **Fondo Base Oscuro**: `#080c14` y `#0a0e1a` (Espacio profundo con destellos fluidos).
*   **Verde Principal (Acento Central)**: `#10b981` (Emerald Green) - Utilizado para botones primarios, estados activos y elementos clave de la interfaz.
*   **Verde Brillante / Menta**: `#34d399` (Mint Green) - Destinado a gradientes ascendentes, textos destacados y destellos secundarios.
*   **Azul Tecnológico / Cian**: `#06b6d4` (Teal/Cyan) - Utilizado como acento secundario para efectos de profundidad y enlaces.
*   **Glow Liquid Glass (Verde)**: `rgba(16, 185, 129, 0.12)` (Resplandor verde traslúcido).

### Estilo Glassmorphism (Liquid Glass)

Todas las interfaces y tarjetas del proyecto implementan un efecto de cristal líquido translúcido:
*   **Transparencia de Fondo**: `rgba(255, 255, 255, 0.02)` a `rgba(255, 255, 255, 0.06)` combinado con fondos radiales.
*   **Efecto de Desenfoque**: `backdrop-filter: blur(20px) saturate(180%)`.
*   **Bordes de Cristal Reactivos**: Bordes ultra-delgados que reaccionan con un brillo verde esmeralda y cian al pasar el cursor (`hover`).
*   **Sombras y Resplandores**: Combinación de sombras internas blancas muy sutiles (`rgba(255, 255, 255, 0.05)`) y resplandores exteriores basados en verde esmeralda.