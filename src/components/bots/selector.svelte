<script>
  import { onMount } from "svelte";
  import { checkBalances, tokenIds, botUrl, openseaLink, botNames, botImages } from "./botBalance.js";

  let balances = {};

  onMount(async () => {
    try {
      console.log("Iniciando el selector de bots");
      
      balances = await checkBalances();
      console.log(balances);
      
    } catch (error) {
      console.error("Error al obtener balances:", error);
    }

  });
</script>

<style>
  .bot-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }
  
  .bot-glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37),
                inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 1.5rem;
    text-align: center;
    width: 100%;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .bot-glass-card:hover {
    transform: translateY(-6px);
    border-color: rgba(64, 205, 224, 0.3);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5),
                0 0 20px rgba(64, 205, 224, 0.15),
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }

  .bot-title {
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: linear-gradient(120deg, #fff 40%, #a5b1f4 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .bot-img-container {
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
  }

  .bot-img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
  }

  .bot-glass-card:hover .bot-img {
    transform: scale(1.08) rotate(1deg);
  }

  .bot-badge {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
  }

  .badge-bybit {
    background: rgba(247, 166, 0, 0.15);
    color: #f7a600;
    border: 1px solid rgba(247, 166, 0, 0.3);
  }

  .badge-binance {
    background: rgba(240, 185, 11, 0.15);
    color: #f0b90b;
    border: 1px solid rgba(240, 185, 11, 0.3);
  }

  .badge-quant {
    background: rgba(99, 102, 241, 0.15);
    color: #818cf8;
    border: 1px solid rgba(99, 102, 241, 0.3);
  }

  .action-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .action-btn.green {
    background: rgba(16, 185, 129, 0.18);
    border: 1px solid rgba(16, 185, 129, 0.35);
    color: #34d399;
  }

  .action-btn.green:hover {
    background: rgba(16, 185, 129, 0.3);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.25);
    transform: translateY(-1px);
  }

  .action-btn.red {
    background: rgba(239, 68, 68, 0.12);
    border: 1px solid rgba(239, 68, 68, 0.25);
    color: #f87171;
  }

  .action-btn.red:hover {
    background: rgba(239, 68, 68, 0.22);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
    transform: translateY(-1px);
  }

  @media (max-width: 640px) {
    .bot-grid {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
    .bot-glass-card {
      padding: 1.25rem;
    }
    .bot-img-container {
      height: 120px;
    }
  }
</style>

<div class="bot-grid py-4">
  {#each tokenIds as id}
    <div class="bot-glass-card">
      <div class="flex items-center justify-between w-full">
        <span class="bot-title">
          {botNames[id-1]}
        </span>
        {#if id === 1}
          <span class="bot-badge badge-bybit">Bybit</span>
        {:else if id === 2}
          <span class="bot-badge badge-binance">Binance</span>
        {:else}
          <span class="bot-badge badge-quant">Quant V2</span>
        {/if}
      </div>
      
      <div class="bot-img-container">
        <img
          src="/images/{botImages[id-1]}"
          class="bot-img"
          alt="bot {botNames[id-1]}"
          loading="lazy"
        />
      </div>

      <p class="text-xs text-gray-400 m-0">
        {#if id === 1}
          Estrategia Mean Reversion EMA 59 con filtros de volatilidad Bybit.
        {:else if id === 2}
          Estrategia Mean Reversion EMA 59 con conexión a futuros Binance.
        {:else}
          Score de Expansión, Medias de Inercia y Flujo de Capital (OI).
        {/if}
      </p>

      <div class="w-full mt-auto pt-2">
        {#if balances[id] > 0}
          <a class="action-btn green text-center" href="/bot/{botUrl[id-1]}">
            <span>Entrar al Bot</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        {:else}
          <div class="flex flex-col gap-2">
            <a class="action-btn green text-center" href="/bot/{botUrl[id-1]}">
              <span>Ver Bot</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a class="action-btn red text-center text-xs py-2" href="{openseaLink}/{id}" target="_blank" rel="noopener noreferrer">
              <span>Obtener NFT #{id} en OpenSea</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>