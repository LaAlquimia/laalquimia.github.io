<!-- from nanostores verify login -->

<script> 
    import { isLoginPersistent } from "../../store";
    import { botConfig } from "../../store";
    import { onMount } from "svelte";
    import { userInfo } from "../../store";
    import { checkBalances } from "../bots/botBalance.js";
    import GlassSelector from "./GlassSelector.svelte";

    let balances = {};
    let nftBalance ;
    let nft2Balance ;
    let nft3Balance ;
    onMount(async () => {
  try {
    console.log("Iniciando el selector de bots");
    
    balances = await checkBalances();
    console.log(balances);
    // balance on 1 or 2

    nftBalance= balances[1]   
    nft2Balance= balances[2]
    nft3Balance= balances[3]
    console.log(nftBalance);
    
  } catch (error) {
    console.error("Error al obtener balances:", error);
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

<!-- Main Container -->
<div class="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-6 text-gray-200">
    
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

    <!-- Tables & Filters Column -->
    <div id="tables" class="w-full lg:w-2/5 liquid-glass-card p-3.5 sm:p-5 flex flex-col gap-5">
        <!-- Selectores sobre la tabla -->
        <div class="flex flex-wrap justify-between items-center pb-3 border-b border-white/10 gap-3">
            <span class="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Filtros Activos</span>
            <div class="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                <GlassSelector id="symbolSelector" defaultValue="BTCUSDT">
                    <option value="BTCUSDT">BTCUSDT</option>
                    <option value="ETHUSDT">ETHUSDT</option>
                    <option value="ETCUSDT">ETCUSDT</option>
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
                    <option value="360">6h</option>
                    <option value="720">12h</option>
                    <option value="D">1d</option>
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
    
    <script data-is-inline src="/notification.js"></script>
    <script data-is-inline src="/Binance/fetcher.js?v=3"></script>
    <script data-is-inline src="/Binance/handler.js?v=3"></script>
    <script data-is-inline src="/Binance/runtime.js"></script>
    <script data-is-inline src="/Binance/graph/graph.js"></script>

    <script
        data-is-inline
        src="https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js"></script>
</div>