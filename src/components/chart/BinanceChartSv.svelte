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
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(16px) saturate(180%);
        -webkit-backdrop-filter: blur(16px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border-radius: 16px;
        transition: all 0.3s ease;
    }

    .liquid-glass-card:hover {
        border-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    }

    .glass-table th {
        background: rgba(255, 255, 255, 0.05) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8) !important;
    }

    .glass-table {
        border-collapse: separate;
        border-spacing: 0;
    }

    /* Glow effect in background */
    .glow-container {
        position: relative;
    }

    .glow-container::before {
        content: "";
        position: absolute;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(64, 205, 224, 0.15) 0%, rgba(0,0,0,0) 70%);
        top: -50px;
        left: -50px;
        z-index: -1;
        pointer-events: none;
    }
</style>

<!-- if  -->
{#if  nftBalance > 0 || nft2Balance > 0 || nft3Balance > 0}

<div class="pb-3 px-3 text-gray-200 w-full lg:flex glow-container">
    <div class="liquid-glass-card lg:w-3/5 my-3 mx-3 p-4">
        
        <div>

            <span>
                <div class="mx-3 rounded-xl overflow-hidden">
                    <div class="chart" id="chart"></div>
                </div>
            </span>
            <span class="py-3 font-bold">
                <div class="flex-row md:flex px-3 justify-between items-center py-3 px-5 gap-4">
                    <h4 class="m-0 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">BINANCE</h4>
                </div>
                <!-- aqui van las configuraciones y los agregados  -->
                <h5 class="text-[#40cde0] opacity-80 px-5 text-sm">
                    ema 59
                </h5>
            </span>
            
        </div>
    </div>
    <div id="tables" class="my-3 px-5 lg:w-2/5 liquid-glass-card mx-3 py-5" style="overflow: visible;">
        <!-- Selectores sobre la tabla -->
        <div class="flex justify-between items-center mb-6 pb-4 border-b border-[rgba(255,255,255,0.08)] gap-3">
            <span class="font-extrabold text-sm text-gray-400 uppercase tracking-wider">Filtros</span>
            <div class="flex gap-2 items-center">
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

        <div class="mb-6 overflow-x-auto">
            <h4 class="text-rose-400 font-bold mb-3 flex items-center gap-2">SHORT 🔻</h4>
            <table
                class="w-full text-left rtl:text-right text-gray-300 glass-table rounded-lg overflow-hidden"
                id="positiveTable"
            >
                <thead
                    class="uppercase"
                >
                    <tr>
                        <th class="p-3">Symbol</th>
                        <th class="p-3">%Ema59</th>
                        <th class="p-3">%24h</th>
                    </tr>
                </thead>
                <tbody ></tbody>
            </table>
        </div>

        <div class="overflow-x-auto">
            <h4 class="text-emerald-400 font-bold mb-3 flex items-center gap-2">LONG 🔼</h4>
            <table
                class="w-full text-left rtl:text-right text-gray-300 glass-table rounded-lg overflow-hidden"
                id="negativeTable"
            >
                <thead
                    class="uppercase"
                >
                    <tr>
                        <th class="p-3">Symbol</th>
                        <th class="p-3">%Ema59</th>
                        <th class="p-3">%24h</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        </div>
    </div>

    <script
        src="https://cdn.jsdelivr.net/npm/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.min.js"
    ></script>
    
    <script data-is-inline src="/notification.js"></script>
    <script data-is-inline src="/Binance/fetcher.js"></script>
    <script data-is-inline src="/Binance/handler.js"></script>
    <script data-is-inline src="/Binance/runtime.js"></script>
    <script data-is-inline src="/Binance/graph/graph.js"></script>

    <script
    data-is-inline
        src="https://cdn.jsdelivr.net/npm/ta-lib@0.11.0/index.min.js"></script>
    <script></script>
</div>

{/if}