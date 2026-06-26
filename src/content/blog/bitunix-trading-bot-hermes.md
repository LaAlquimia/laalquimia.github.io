---
title: '⚡ Guía Paso a Paso: Cómo Crear un Bot de Trading Algorítmico en Bitunix con Python y Hermes'
description: 'Aprende a estructurar un bot de futuros perpetuos robusto para Bitunix. Analizamos el motor de doble firma SHA-256 en Python y una estrategia agresiva de volumen con grilla TP.'
pubDate: 'Jun 25 2026'
heroImage: '/images/TraderBot.webp'
---
# ⚡ El Arte del Trading Algorítmico: Creando un Bot de Futuros para Bitunix con Python y Hermes

El trading algorítmico en mercados de futuros perpetuos exige rapidez, precisión y una infraestructura robusta. Si operas en **Bitunix** y buscas automatizar tus estrategias preferidas para generar volumen o capturar micro-tendencias intradiarias, necesitas un diseño modular que separe el cliente de conexión, la orquestación de llamadas y la lógica matemática.

En esta guía técnica analizamos la arquitectura de producción de nuestro repositorio de ejemplo [la-alquimia-bitunix-trading-bot](https://github.com/LaAlquimia/la-alquimia-bitunix-trading-bot), revelando cómo construir un motor de ejecución automatizado que soporte cambios en caliente de estrategias, empleando a nuestro asistente de IA **Hermes** para acelerar el desarrollo y corregir errores complejos.

![Bot de Trading Algorítmico en Bitunix](/images/TraderBot.webp)

---

## 🔒 1. El Desafío de Autenticación: La Firma Doble SHA-256

El primer obstáculo al trabajar con la OpenAPI de contratos de Bitunix es su sistema de cifrado. A diferencia de otros exchanges que usan un HMAC de un solo paso, Bitunix requiere una **Firma de Doble Etapa** sobre entradas encadenadas sin espacios.

La estructura matemática se desglosa así:

1. **Entrada Digest inicial:** Se unen en formato crudo el `nonce` (un UUID aleatorio), el `timestamp` (en milisegundos), tu `api_key`, los query parameters ordenados alfabéticamente en ASCII y el cuerpo JSON comprimido (sin espacios internos).
2. **Encriptación Nivel 1:** Se calcula un hash SHA-256 simple sobre la entrada anterior.
3. **Firma Nivel 2:** El hash digest resultante se concatena con la clave privada (`secret_key`) del usuario y se cifra nuevamente en SHA-256, que finalmente se envía en la cabecera HTTP `sign`.

Aquí tienes la implementación exacta en Python contenida en nuestro `bitunix_client.py`:

```python
def _sign(self, nonce: str, timestamp: str, query_params: str, body: str) -> str:
    """
    Genera la firma utilizando el proceso de doble SHA256 requerido por Bitunix Futures:
    1. digest = SHA256(nonce + timestamp + api_key + sorted_query_params + body)
    2. sign = SHA256(digest + secret_key)
    """
    digest_input = nonce + timestamp + self.api_key + query_params + body
    
    # Encriptación nivel 1
    digest = hashlib.sha256(digest_input.encode('utf-8')).hexdigest()
    
    # Encriptación nivel 2 usando la SecretKey
    sign_input = digest + self.secret_key
    signature = hashlib.sha256(sign_input.encode('utf-8')).hexdigest()
    return signature
```

Gracias a este motor desacoplado dentro de un `BitunixFuturesClient` genérico, las peticiones HTTP se firman de manera transparente en cada GET o POST, evitando rechazos de firmas de la API.

---

## 🏗️ 2. Arquitectura Concurrente y Modulación Dinámica

Para evitar tocar el código core del bot de trading cada vez que quieras cambiar de indicador de análisis técnico, el diseño en `run_bot.py` implementa **carga dinámica de estrategias**. 

A través del paquete base `importlib`, el orquestador busca dentro de la carpeta `strategies/` cualquier archivo Python que herede de la clase base `BaseStrategy` e inicializa una instancia de él en tiempo de ejecución. 

```text
la-alquimia-bitunix-trading-bot/
├── .env                              # API Keys y parámetros privados
├── requirements.txt                  # Dependencias esenciales (pandas, requests, inspect)
├── bitunix_client.py                 # Cliente de red API & Sign
├── run_bot.py                        # Orquestador: Tick loop y carga de estrategias
├── cancel_orders.py                  # Utilidad para borrar órdenes límite colgadas
└── strategies/                       # Módulos desconectados de lógicas algorítmicas
    ├── __init__.py                   # Define la plantilla rígida (BaseStrategy)
    └── macd_ema_grid_strategy.py     # Estrategia activa: MACD + Grilla TP de 10 niveles
```

Esta separación limpia permite depurar el cliente HTTP o simular el bot sin arriesgarte a que un cambio de fórmula rompa la máquina de estado que sostiene tu sesión en el backend.

---

## 📊 3. Estrategia MACDEMAGridStrategy: Alta Frecuencia en SOLUSDT

Dentro de la suite, la estrategia por defecto de volumen agresivo actúa sobre el par `SOLUSDT` en intervalos cortos de **1 minuto**. Combina dos fases operativas:

### Fase A: Disparo de Tendencia (Momento Rápido)
Emplea cálculos rápidos de **MACD (12, 26, 9)**. Al operar en marcos de 1 minuto, el algoritmo detecta el cruce ascendente o descendente de la línea de MACD con la línea de Señal para colocar inmediatamente una orden de compra o venta a precio de mercado (`MARKET`). La velocidad es vital para no perder el spread del volumen de ruptura.

### Fase B: Recolección Fraccionada con Grilla Límite (10 Niveles)
El gran truco de este bot para evitar reveses repentinos de precio es que no espera a que el precio golpee un único objetivo estático de Take Profit.
1. El algoritmo calcula la **Variación Porcentual Promedio (Average Percentage Variation)** de las últimas 200 velas para medir la volatilidad real.
2. Inmediatamente después de abrir la posición, cancela órdenes viejas y despliega **10 órdenes LIMIT consecutivas (grilla)** a diferentes micro-precios espaciados dinámicamente según la volatilidad y los costos de comisión.
3. A medida que el precio fluctúa a favor de la tendencia, las órdenes límite de la grilla se ejecutan parcialmente, garantizando capturas de ganancias rápidas incluso si la vela de 1 minuto se retrae antes del cierre.

```python
# Ejemplo matemático de posicionamiento de salidas en grilla (Long)
grid_step = avg_pct_var / self.grid_precision
for i in range(self.grid_levels):
    tp_price = entry_price * (1 + self.fee_rate + grid_step * i)
    # Colocar orden LIMIT asociada para cerrar posición parcial
```

---

## 🛠️ 4. Instalación y Puesta en Marcha Rápida

Para desplegar este bot en tu VPS o máquina local, sigue estos sencillos pasos:

### Paso 1: Clonar e instalar requerimientos
Crea un entorno virtual limpio de Python 3.10 o superior (sugerido Python 3.14 o la versión activa de tu sistema) y descarga las librerías:
```bash
git clone https://github.com/LaAlquimia/la-alquimia-bitunix-trading-bot
cd la-alquimia-bitunix-trading-bot
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

### Paso 2: Crear el archivo secreto
Crea una copia de la plantilla `.env.example` y renómbrala a `.env`:
```bash
cp .env.example .env
```
Abre el archivo con tu editor y añade tus datos en el API del exchange Bitunix:
```env
BITUNIX_API_KEY=tu_api_key_real_aqui_generada_en_bitunix
BITUNIX_SECRET_KEY=tu_secret_key_real_aqui
TRADING_QTY_SOL=1.0
```

### Paso 3: Ejecutar el Orquestador principal
Inicia el ciclo de ejecución continua. El script verificará tu saldo disponible en USDT antes de dar luz verde al detector de cruces de velas:
```bash
python3 run_bot.py
```

*Tip de emergencia:* Si por cambios bruscos de mercado detienes el bot con posiciones cerradas y quedan deudas u órdenes límite huérfanas en el libro de órdenes, puedes limpiarlas instantáneamente ejecutando:
```bash
python3 cancel_orders.py
```

---

## 🤖 5. ¿Cómo te ayuda Hermes a Construir e Iterar un Bot de Trading?

Desarrollar bots algorítmicos requiere una fase de prueba y corrección pesimista: ¿qué ocurre si el exchange se desconecta?, ¿qué pasa si se duplica una orden? Aquí es donde **Hermes** aporta un valor asombroso trabajando de la mano contigo directamente en la terminal:

1. **Refactorización Compleja (Ej: Soporte para Modo Cobertura / Hedge Mode):**
   Actualmente, la estrategia `MACDEMAGridStrategy` asume una sola posición unidireccional en el exchange. Si deseas escalar y operar con coberturas activas (posiciones **LONG** y **SHORT** abiertas simultáneamente en modo hedge), puedes pedirle a Hermes que modifique el código para almacenar ids de posiciones en paralelo. Hermes reescribirá exactamente el parser de posiciones de manera segura y sin romper la tipificación de datos.
2. **Creación Automática de Pruebas Unitarias:**
   Evita testear tus algoritmos con dinero real. Con Hermes a tu comando, puedes generar simuladores (*mocks*) en Python de las respuestas JSON de Bitunix para validar pasivamente que tus indicadores matemáticos computan cruces correctos con datos sintéticos.
3. **Escaneos de Optimización Matemática:**
   ¿Los 10 niveles de take profit de la grilla te generan demasiadas comisiones y merman el rendimiento neto? Puedes pedirle a Hermes que analice el impacto del `fee_rate` integrado y recalcule dinámicamente el `grid_step` ajustado por spreads.

El trading algorítmico ya no exige lidiar solo con las trabas de conexión de las APIs de cripto. Al emplear plantillas limpias, modulación desacoplada y un copiloto rápido en tu terminal como Hermes, puedes enfocarte estrictamente en lo que de verdad importa: **pulir tu estrategia y acumular rendimiento de forma inteligente!**
