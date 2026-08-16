<script> 
    import { onMount, tick } from "svelte";
    import { isLoginPersistent, botConfig, userInfo } from "../../store";
    import { checkBalances } from "../bots/botBalance.js";
    import GlassSelector from "./GlassSelector.svelte";

    let balances = {};
    let nft2Balance = 0;
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
            nft2Balance = parseInt(balances[2] || 0);
        } catch (error) {
            console.error("Error al obtener balances:", error);
        } finally {
            loadingBalance = false;
        }

        if (nft2Balance > 0) {
            await tick();
            try {
                await loadScript("https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.min.js");
                await loadScript("https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js");
                await loadScript("/notification.js");
                await loadScript("/Binance/fetcher.js?v=4");
                await loadScript("/Binance/handler.js?v=4");
                await loadScript("/Binance/graph/graph.js?v=4");
                await loadScript("/Binance/runtime.js?v=4");
            } catch (e) {
                console.error("Error cargando scripts de Binance:", e);
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
        border-color: rgba(240, 185, 11, 0.25);
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
        <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-yellow-400"></div>
        <span class="text-sm font-semibold text-gray-400">Verificando acceso a Binance Mean Reversion...</span>
    </div>
{:else if nft2Balance > 0}
<!-- Main Container -->
<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 text-gray-200">
    
    <!-- Top Interactive Grid: Chart & Signals Scanner -->
    <div class="flex flex-col lg:flex-row gap-6">
        <!-- Chart Column -->
        <div class="liquid-glass-card w-full lg:w-3/5 p-3.5 sm:p-5 flex flex-col gap-4">
            <!-- Chart Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div class="flex items-center gap-3">
                    <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                        BINANCE FUTURES
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

            <!-- Chart Footer / Legend -->
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 pt-1">
                <div class="flex items-center gap-4 flex-wrap">
                    <div class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#4a50bf]"></span>
                        <span>EMA 59</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#bf964a]"></span>
                        <span>Umbral Superior</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="w-2.5 h-2.5 rounded-full bg-[#4abf71]"></span>
                        <span>Umbral Inferior</span>
                    </div>
                </div>
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

    <!-- SECCIÓN DETALLADA: Arquitectura y Funcionamiento del Algoritmo Binance -->
    <div class="liquid-glass-card p-6 sm:p-10 flex flex-col gap-8 border border-white/[0.08] bg-slate-900/40 rounded-3xl mt-2">
        
        <!-- Encabezado de la Documentación -->
        <div class="flex flex-col gap-3 border-b border-white/5 pb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/50 border border-yellow-500/30 text-yellow-400 text-xs font-bold tracking-wider uppercase self-start font-mono">
                <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>Arquitectura Cuantitativa del Algoritmo</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
                ¿Cómo funciona el Scanner de Binance Futures (USDⓈ-M)?
            </h2>
            <p class="text-xs sm:text-sm text-gray-400 max-w-4xl leading-relaxed m-0">
                Sistema de escaneo continuo de microestructura conectado directamente a los servidores de Binance Futures para rastrear ineficiencias de reversión estadística sobre los 50 contratos de mayor liquidez del mercado cripto.
            </p>
        </div>

        <!-- 3 Pilares del Algoritmo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <!-- Pilar 1: Streaming WebSocket de Ultra Baja Latencia -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 font-bold text-xs">
                        01
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Conexión Directa Binance FAPI</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Canal directo con la infraestructura de derivados de Binance para ingesta de datos en tiempo real:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">API REST & WSS:</b> Consumo de klines, tickers y libro de órdenes de alta frecuencia.</li>
                    <li><b class="text-white">Top 50 Monedas:</b> Filtrado automático de los activos con mayor volumen y profundidad.</li>
                    <li><b class="text-white">Latencia &lt; 20ms:</b> Procesamiento en cliente de señales y cambios de tendencia.</li>
                </ul>
            </div>

            <!-- Pilar 2: Canales de Desviación & Bandas -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                        02
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Canales de Desviación EMA 59</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Identifica zonas de agotamiento extremo del precio fuera de los límites normales de dispersión:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">Umbral Superior:</b> Zona de toma de beneficios y posicionamiento en corto (Short).</li>
                    <li><b class="text-white">Umbral Inferior:</b> Zona de capitulación de ventas y rebote al alza (Long).</li>
                    <li><b class="text-white">Interacción Fluida:</b> Sincronización instantánea del gráfico al tocar cualquier fila.</li>
                </ul>
            </div>

            <!-- Pilar 3: Clasificación Inteligente en Tiempo Real -->
            <div class="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col gap-3.5">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                        03
                    </div>
                    <h3 class="text-base font-bold text-white m-0">Rankings de Sobreextensión</h3>
                </div>
                <p class="text-xs text-gray-400 leading-relaxed">
                    Algoritmo de clasificación continua que mantiene ordenados los pares con mayor probabilidad estadística:
                </p>
                <ul class="text-xs text-gray-300 space-y-2 font-mono list-disc pl-4">
                    <li><b class="text-white">Top 10 Shorts:</b> Pares con mayor sobrecompra porcentual respecto a su media.</li>
                    <li><b class="text-white">Top 10 Longs:</b> Pares con mayor sobreventa porcentual en la última sesión.</li>
                    <li><b class="text-white">Tab Switcher:</b> Alternancia instantánea entre pestañas con renderizado completo.</li>
                </ul>
            </div>

        </div>

        <!-- Fórmula Matemática y Parámetros -->
        <div class="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div class="space-y-1.5 max-w-xl">
                <h4 class="text-sm font-bold text-yellow-400 uppercase tracking-wide font-mono m-0">Métrica Central de Dispersión</h4>
                <p class="text-xs text-gray-300 leading-relaxed m-0">
                    Calcula la distancia porcentual del precio respecto a la media ponderada exponencial de 59 períodos:
                </p>
                <div class="p-3 bg-black/40 border border-white/5 rounded-xl text-yellow-300 font-mono text-xs sm:text-sm">
                    Distancia_EMA = ((Precio - EMA_59) / Precio) × 100
                </div>
            </div>

            <div class="space-y-2 text-xs text-gray-400 w-full sm:w-auto self-stretch sm:self-auto border-t sm:border-t-0 sm:border-l border-white/5 pt-4 sm:pt-0 sm:pl-6">
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Mercado:</span>
                    <span class="text-yellow-400 font-semibold">Binance USDⓈ-M Futures</span>
                </div>
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Universo de Activos:</span>
                    <span class="text-cyan-400 font-semibold">Top 50 Liquid Contracts</span>
                </div>
                <div class="flex items-center justify-between sm:justify-start gap-4">
                    <span class="text-gray-500 font-mono">Filtro de Tendencia:</span>
                    <span class="text-white font-semibold">EMA 59 & Bandas de Desviación</span>
                </div>
            </div>
        </div>

    </div>

</div>
{:else}
<div class="flex items-center justify-center min-h-[70vh] text-white p-4">
    <div class="liquid-glass-card p-8 max-w-md text-center flex flex-col items-center gap-4">
        <div class="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-tight">Acceso Restringido</h2>
        <p class="text-sm text-gray-400">
            Para acceder al bot <b>Binance Mean Reversion</b> debes conectar tu wallet y poseer al menos 1 NFT de la estrategia (#2) en la red Base.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <a class="flex-1 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-sm font-bold transition-all text-center" href="https://opensea.io/assets/base/0xd78be833ed889929b50d2ad3ab7ba94f76a9a8bf/2" target="_blank" rel="noopener noreferrer">
                Obtener NFT #2
            </a>
            <a class="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-semibold text-gray-200 transition-all text-center" href="/bot">
                Ver Bots
            </a>
        </div>
    </div>
</div>
{/if}