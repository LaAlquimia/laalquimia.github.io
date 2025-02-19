<script>
  import { onMount } from "svelte";
  import { checkBalances, tokenIds, botUrl, openseaLink } from "./botBalance.js";

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
    gap: 20px;
    justify-content: center;
  }
  .bot-card {
    padding: 20px;
    text-align: center;
    width: 150px;
  }
  .bot-card a {
    display: block;
    font-weight: bold;
  }
  .bot-card a.green {
    color: green;
  }
  .bot-card a.red {
    color: red;
  }
</style>

<div class="bot-container pt-10 pb-10">
  {#each tokenIds as id}
    <div class="bot-card flex-col shadow-xl rounded-xl hover:scale-105 bg-black">
      <a>Bot {botUrl[id-1]}</a>
      <img
						src="/images/botMeanRev1.png"
						class="w-full h-18"
						alt="tortuga"
					/>
      {#if balances[id] > 0}
        <a class="green" href="/bot/{botUrl[id-1]}">Entrar</a>
        

      {:else}
        <a class="red" href="{openseaLink}/{id}" target="_blank">Conseguir en OpenSea</a>
      {/if}
    </div>
  {/each}
</div>