<!-- from nanostores verify login -->

<script> 
    import { isLoginPersistent } from "../../store";
    import { botConfig } from "../../store";
    import { onMount } from "svelte";
    import { userInfo } from "../../store";
    import { checkBalances } from "../bots/botBalance.js";
    import GlassSelector from "./GlassSelector.svelte";

    let balances = {};
    let nftBalance = 0;
    let loadingBalance = true;

    onMount(async () => {
        try {
            balances = await checkBalances();
            nftBalance = parseInt(balances[1] || 0);
        } catch (error) {
            console.error("Error al obtener balances:", error);
        } finally {
            loadingBalance = false;
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
<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-6 text-gray-200">
    
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

        <slot />
    </div>

    <!-- Signals and Tables Column -->
    <div class="liquid-glass-card w-full lg:w-2/5 p-3.5 sm:p-5 flex flex-col gap-5">
        <!-- Header & Selectors -->
        <div class="flex flex-col gap-3 pb-3 border-b border-white/5">
            <div class="flex items-center justify-between">
                <h3 class="text-base sm:text-lg font-bold text-white tracking-wide m-0">Scanner de Señales</h3>
                <span class="text-xs text-gray-400 font-mono" id="ticker-time">--:--:--</span>
            </div>
            
            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
                <GlassSelector id="tickerSelect" defaultValue="BTCUSDT">
                    <option value="BTCUSDT">BTCUSDT</option>
                </GlassSelector>

                <GlassSelector id="intervalSelect" defaultValue="1">
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

        <!-- Tabla SHORT -->
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <h4 class="text-rose-400 font-bold text-sm sm:text-base flex items-center gap-2 m-0">
                    <span>SHORT</span>
                    <span class="text-xs">🔻 Sobrecomprados</span>
                </h4>
            </div>
            <div class="overflow-x-auto rounded-xl border border-white/5 max-h-56 overflow-y-auto">
                <table
                    class="w-full text-left rtl:text-right text-gray-300 glass-table"
                    id="positiveTable"
                >
                    <thead class="uppercase sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
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
        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <h4 class="text-emerald-400 font-bold text-sm sm:text-base flex items-center gap-2 m-0">
                    <span>LONG</span>
                    <span class="text-xs">🔼 Sobreventidos</span>
                </h4>
            </div>
            <div class="overflow-x-auto rounded-xl border border-white/5 max-h-56 overflow-y-auto">
                <table
                    class="w-full text-left rtl:text-right text-gray-300 glass-table"
                    id="negativeTable"
                >
                    <thead class="uppercase sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
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

    <!-- Third party and chart logic scripts -->
    <script
        src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.min.js"
    ></script>
    
    <script data-is-inline src="/scripts/fetcher.js?v=3"></script>
    <script data-is-inline src="/notification.js"></script>
    <script data-is-inline src="/scripts/handler.js?v=3"></script>
    <script data-is-inline src="/scripts/notification.js"></script>
    <script data-is-inline src="/scripts/runtime.js"></script>
    <script data-is-inline src="/scripts/graph/graph.js"></script>

    <script
        data-is-inline
        src="https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js"></script>
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