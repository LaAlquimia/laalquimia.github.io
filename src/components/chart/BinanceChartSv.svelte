<!-- from nanostores verify login -->

<script> 
    import { isLoginPersistent } from "../../store";
    import { botConfig } from "../../store";
    import { onMount } from "svelte";
    import { userInfo } from "../../store";
    import { checkBalances } from "../bots/botBalance.js";
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

<!-- if  -->
{#if  nftBalance > 0 || nft2Balance > 0 || nft3Balance > 0}

<div class="pb-3 px-3 text-gray-200 w-full lg:flex ">
    <div class="bg-black lg:w-3/5 my-3 rounded-xl mx-3">
        
        <div style="">

            <span>
                <div class="mx-3 rounded-xl">
                    <div class="chart" id="chart"></div>
                </div>
            </span>
            <span class="py-3 font-bold">
                <div class="flex-row md:flex px-3 justify-between py-3 px-5">
                    <h4 class="">BINANCE </h4>
                    <select
                        id="symbolSelector"
                        class="bg-black border border-gray-600 text-gray-200 py-1 px-5 rounded"
                    >
                    <option value="BTCUSDT">BTCUSDT</option>
                    <option value="ETHUSDT">ETHUSDT</option>
                    <option value="ETCUSDT">ETCUSDT</option>
                    </select>
    
                    <select id="intervalSelector"
                        class="bg-black border border-gray-600 text-gray-200 py-1 px-5 rounded"
                    >
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
                    </select>
                </div>
                <!-- aqui van las configuraciones y los agregados  -->
                <h5 class="text-[#1412b0ae] px-5 ">
                    ema 59
                </h5>
            </span>
            
        </div>
    </div>
    <div id="tables" class="overflow-x-auto my-3 px-3  lg:w-2/5 bg-black rounded-xl mx-3 py-3 ">
        <div>
            <h4>SHORT 🔻</h4>
            <table
                class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-400"
                id="positiveTable"
            >
                <thead
                    class="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                >
                    <tr>
                        <th>Symbol</th>
                        <th>%Ema59</th>
                        <th>%24h</th>
                    </tr>
                </thead>
                <tbody ></tbody>
            </table>
        </div>

        <div>
            <h4>LONG 🔼</h4>
            <table
                class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-400"
                id="negativeTable"
            >
                <thead
                    class="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
                >
                    <tr>
                        <th>Symbol</th>
                        <th>%Ema59</th>
                        <th>%24h</th>
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