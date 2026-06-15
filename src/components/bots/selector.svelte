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
  .bot-container {
    display: flex;
    gap: 30px;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .bot-glass-card {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37),
                inset 0 1px 1px rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 24px;
    text-align: center;
    width: 200px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-decoration: none;
    color: #fff;
  }

  .bot-glass-card:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: rgba(64, 205, 224, 0.3);
    box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5),
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
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .bot-img {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    transition: transform 0.4s ease;
  }

  .bot-glass-card:hover .bot-img {
    transform: scale(1.1) rotate(2deg);
  }

  .action-btn {
    width: 100%;
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 1px solid transparent;
  }

  .action-btn.green {
    background: rgba(16, 185, 129, 0.15);
    border-color: rgba(16, 185, 129, 0.3);
    color: #34d399;
  }

  .action-btn.green:hover {
    background: rgba(16, 185, 129, 0.25);
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
  }

  .action-btn.red {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.25);
    color: #f87171;
  }

  .action-btn.red:hover {
    background: rgba(239, 68, 68, 0.22);
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.15);
  }
</style>

<div class="bot-container pt-10 pb-10">
  {#each tokenIds as id}
    <div class="bot-glass-card">
      <span class="bot-title">
        Bot {botNames[id-1]}
      </span>
      
      <div class="bot-img-container">
        <img
          src="/images/{botImages[id-1]}"
          class="bot-img"
          alt="bot icon"
        />
      </div>

      {#if balances[id] > 0}
        <a class="action-btn green text-center" href="/bot/{botUrl[id-1]}">Entrar</a>
      {:else}
        <a class="action-btn red text-center" href="{openseaLink}/{id}" target="_blank">OpenSea</a>
      {/if}
    </div>
  {/each}
</div>