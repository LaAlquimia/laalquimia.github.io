<script> 
    import { onMount, tick } from "svelte";
    import { isLoginPersistent, botConfig, userInfo } from "../../store";
    import { checkBalances } from "../bots/botBalance.js";
    import GlassSelector from "./GlassSelector.svelte";

    let balances = {};
    let nftBalance = 0;
    let loadingBalance = true;
    let activeTab = "short"; // "short" or "long"

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement("script");
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    onMount(async () => {
        try {
            balances = await checkBalances();
            nftBalance = parseInt(balances[1] || 0);
        } catch (error) {
            console.error("Error al obtener balances:", error);
        } finally {
            loadingBalance = false;
        }

        if (nftBalance > 0) {
            await tick();
            try {
                await loadScript("https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.min.js");
                await loadScript("https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js");
                await loadScript("/notification.js");
                await loadScript("/scripts/fetcher.js?v=4");
                await loadScript("/scripts/handler.js?v=4");
                await loadScript("/scripts/notification.js");
                await loadScript("/scripts/graph/graph.js?v=4");
                await loadScript("/scripts/runtime.js?v=4");
            } catch (e) {
                console.error("Error cargando scripts de Bybit:", e);
            }
        }
    });
</script>

<style>
    .liquid-glass-card {
        background: rgba(13, 15, 24, 0.6);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 12px 36px 0 rgba(0, 0, 0, 0.45);
        border-radius: 20px;
        transition: all 0.3s ease;
    }

    .liquid-glass-card:hover {
        border-color: rgba(64, 205, 224, 0.2);
        box-shadow: 0 16px 44px 0 rgba(0, 0, 0, 0.6);
    }

    .glass-table th {
        background: rgba(255, 255, 255, 0.04) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        color: rgba(255, 255, 255, 0.7) !important;
        font-size: 11px;
        letter-spacing: 0.5px;
    }

    .glass-table {
        border-collapse: separate;
        border-spacing: 0;
    }

    .glass-table td {
        padding: 8px 12px;
        font-size: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }

    @media (min-width: 640px) {
        .glass-table td {
            padding: 10px 14px;
            font-size: 13px;
        }
        .glass-table th {
            font-size: 12px;
        }
    }
</style>

{#if loadingBalance}
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-gray-300 gap-3 py-16">
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-400"></div>
        <span class="text-sm font-semibold text-gray-400">Verificando acceso a Bybit Mean Reversion...</span>
    </div>
{:else if nftBalance > 0}
<!-- Main Container -->
<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 text-gray-200">
    
    <!-- Top Interactive Grid: Chart & Signals Scanner -->
    <div class="flex flex-col lg:flex-row gap-6">
        <!-- Chart Column -->
        <div class="liquid-glass-card w-full lg:w-3/5 p-3.5 sm:p-5 flex flex-col gap-4">
            <!-- Chart Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div class="flex items-center gap-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        BYBIT LINEAR
                    </span>
                    <span class="text-xs text-cyan-400 font-semibold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50">
                        EMA 59 Reversión
                    </span>
                </div>
                <div class="flex items-center gap-2 text-xs text-gray-400">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Feed en Vivo</span>
                </div>
            </div>

            <!-- Chart Canvas Container -->
            <div class="rounded-xl overflow-hidden border border-white/5 bg-black/60 relative w-full">
                <div class="chart" id="chart"></div>
            </div>
        </div>

        <!-- Signals and Tables Column -->
        <div id="tables" class="liquid-glass-card w-full lg:w-2/5 p-3.5 sm:p-5 flex flex-col gap-5">
            <!-- Header & Selectors -->
            <div class="flex flex-col gap-3 pb-3 border-b border-white/5">
                <div class="flex items-center justify-between">
                    <h3 class="text-base sm:text-lg font-bold text-white tracking-wide m-0">Scanner de Señales</h3>
                    <span class="text-xs text-gray-400 font-mono" id="ticker-time">--:--:--</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                    <GlassSelector id="symbolSelector" defaultValue="BTCUSDT">
                        <option value="BTCUSDT">BTCUSDT</option>
                    </GlassSelector>

                    <GlassSelector id="intervalSelector" defaultValue="1">
                        <option value="1">1m</option>
                        <option value="3">3m</option>
                        <option value="5">5m</option>
                        <option value="15">15m</option>
                        <option value="30">30m</option>
                        <option value="60">1h</option>
                        <option value="120">2h</option>
                        <option value="240">4h</option>
                        <option value="D">1D</option>
                        <option value="M">1M</option>
                        <option value="W">1W</option>
                    </GlassSelector>
                </div>
            </div>

            <!-- Tab Switcher Group -->
            <div class="flex p-1 bg-slate-950/80 border border-white/5 rounded-xl gap-1.5 w-full">
                <button
                    type="button"
                    on:click={() => activeTab = "short"}
                    class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 {activeTab === 'short' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-lg' : 'text-gray-400 hover:text-white border border-transparent'}"
                >
                    <span>🔻 SHORT (Sobrecomprados)</span>
                </button>
                <button
                    type="button"
                    on:click={() => activeTab = "long"}
                    class="flex-1 py-2 px-3 text-center text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 {activeTab === 'long' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg' : 'text-gray-400 hover:text-white border border-transparent'}"
                >
                    <span>🟢 LONG (Sobrevendidos)</span>
                </button>
            </div>

            <!-- Tabla SHORT -->
            <div class="flex flex-col gap-2" style={activeTab === 'short' ? 'display: flex;' : 'display: none;'}>
                <div class="overflow-x-auto rounded-xl border border-white/5">
                    <table
                        class="w-full text-left rtl:text-right text-gray-300 glass-table"
                        id="positiveTable"
                    >
                        <thead class="uppercase bg-slate-900/90 backdrop-blur-md">
                            <tr>
                                <th class="p-2 sm:p-3">Symbol</th>
                                <th class="p-2 sm:p-3">%Ema59</th>
                                <th class="p-2 sm:p-3">%24h</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>

            <!-- Tabla LONG -->
            <div class="flex flex-col gap-2" style={activeTab === 'long' ? 'display: flex;' : 'display: none;'}>
                <div class="overflow-x-auto rounded-xl border border-white/5">
                    <table
                        class="w-full text-left rtl:text-right text-gray-300 glass-table"
                        id="negativeTable"
                    >
                        <thead class="uppercase bg-slate-900/90 backdrop-blur-md">
                            <tr>
                                <th class="p-2 sm:p-3">Symbol</th>
                                <th class="p-2 sm:p-3">%Ema59</th>
                                <th class="p-2 sm:p-3">%24h</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- SECCIÓN DETALLADA: Arquitectura y Funcionamiento del Algoritmo Bybit -->
    <div class="liquid-glass-card p-6 sm:p-10 flex flex-col gap-8 border border-white/[0.08] bg-slate-900/40 rounded-3xl mt-2">
        
        <!-- Encabezado de la Documentación -->
        <div class="flex flex-col gap-3 border-b border-white/5 pb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase self-start font-mono">
                <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Arquitectura Cuantitativa del Algoritmo</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
                ¿Cómo funciona el Algoritmo Bybit Mean Reversion (EMA 59 & RSI 28)?
            </h2>
            <p class="text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed m-0">
                Este modelo estadístico de reversión a la media identifica anomalías de sobreextensión de precios respecto al centro de gravedad exponencial (EMA 59), confirmadas por giros de agotamiento en el oscilador RSI de 28 períodos sobre derivados de Bybit.
            </p>
        </div>

        <!-- 3 Pilares del Algoritmo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Pilar 1: Centro de Gravedad EMA 59 -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                        01
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Centro de Gravedad (EMA 59)</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Mide la dispersión porcentual de cada vela respecto a la media móvil exponencial de 59 períodos:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">Dispersión:</b> ((Precio - EMA_59) / Precio) × 100 en tiempo real.</li>
                    <li><b class="text-white">Sobrecompra (Short):</b> Distancia &gt; +3.0% por encima de la media.</li>
                    <li><b class="text-white">Sobreventa (Long):</b> Distancia &lt; -3.0% por debajo de la media.</li>
                </ul>
            </div>

            <!-- Pilar 2: Filtro de Momentum RSI 28 -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        02
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Agotamiento de Momentum (RSI 28)</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Evita entrar prematuramente contra tendencias fuertes exigiendo confirmación de giro en el oscilador:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">Gatillo Short:</b> RSI(28) &gt; 75 y curvatura bajista (RSI_actual &lt; RSI_prev).</li>
                    <li><b class="text-white">Gatillo Long:</b> RSI(28) &lt; 25 y curvatura alcista (RSI_actual &gt; RSI_prev).</li>
                    <li><b class="text-white">Filtro de Ruido:</b> Período 28 elimina falsas señales de osciladores rápidos de 14 períodos.</li>
                </ul>
            </div>

            <!-- Pilar 3: Scanner Concurrente & Alertas -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        03
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Scanner Concurrente & Voz</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Motor de búsqueda que procesa simultáneamente todos los contratos perpetuos USDT de Bybit:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">Procesamiento Paralelo:</b> Lotes asíncronos de 10 pares con barra de progreso.</li>
                    <li><b class="text-white">Top 10 Rankings:</b> Ordenación inmediata por mayor desviación matemática.</li>
                    <li><b class="text-white">Alquialerta por Voz:</b> Síntesis de voz instantánea al cumplirse todas las condiciones.</li>
                </ul>
            </div>

        </div>

        <!-- Fórmula Matemática y Parámetros -->
        <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="space-y-1.5 max-w-xl">
                <h4 class="text-sm font-bold text-amber-400 uppercase tracking-wide font-mono m-0">Condición de Gatillo de Reversión</h4>
                <p class="text-xs text-gray-300 leading-relaxed m-0">
                    Señal activa únicamente cuando la distancia porcentual supera el umbral crítico y el momentum confirma capitulación:
                </p>
                <div class="p-3 bg-black/40 border border-white/5 rounded-xl text-amber-300 font-mono text-xs sm:text-sm">
                    Condición = (|Precio - EMA_59| / Precio &gt; 3.0%) ∧ (RSI_28 en Extremo con Giro)
                </div>
            </div>

            <div class="space-y-2 text-xs text-gray-400 w-full sm:w-auto self-stretch sm:self-auto border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Exchange:</span>
                    <span class="text-amber-400 font-semibold">Bybit Linear Perpetuals</span>
                </div>
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Tipo de Estrategia:</span>
                    <span class="text-cyan-400 font-semibold">Statistical Mean Reversion</span>
                </div>
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Umbral de Entrada:</span>
                    <span class="text-white font-semibold">±3.0% Desviación vs EMA 59</span>
                </div>
            </div>
        </div>

    </div>

</div>
{:else}
<div class="flex items-center justify-center min-h-[70vh] text-white p-4">
    <div class="liquid-glass-card p-8 max-w-md text-center flex flex-col items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Acceso Restringido</h2>
        <p class="text-sm text-gray-400">
            Para acceder al bot <b>Bybit Mean Reversion</b> debes conectar tu wallet y poseer al menos 1 NFT de la estrategia (#1) en la red Base.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <a class="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-sm font-bold transition-all text-center" href="https://opensea.io/assets/base/0xd78be833ed889929b50d2ad3ab7ba94f76a9a8bf/1" target="_blank" rel="noopener noreferrer">
                Obtener NFT #1
            </a>
            <a class="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold text-gray-200 transition-all text-center" href="/bot">
                Ver Bots
            </a>
        </div>
    </div>
</div>
{/if}