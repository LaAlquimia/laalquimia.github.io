<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import { userInfo, isLogin, isLoginPersistent } from "../../store.js";
  import { checkTokenBalance } from "../../scripts/login.js";
  import { EthereumProvider } from "@walletconnect/ethereum-provider";

  const walletConnectProjectId = import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID || "95ff530dfcf95101a07010f3c5520e54";

  let showModal = false;
  let detectedProviders = [];
  let isConnecting = false;
  let showDropdown = false;
  let copied = false;

  onMount(async () => {
    const savedAddress = localStorage.getItem("accountAddress");
    if (savedAddress) {
      userInfo.setKey("address", savedAddress);
      isLogin.set(true);
      isLoginPersistent.set(true);
      try {
        const balance = await checkTokenBalance(savedAddress);
        if (balance) {
          userInfo.setKey("balance", parseFloat(balance).toFixed(2));
        }
      } catch (e) {
        console.error("Error al obtener balance inicial:", e);
      }
    }

    const handleAnnounceProvider = (event) => {
      const providerDetail = event.detail;
      if (!detectedProviders.some(p => p.info.uuid === providerDetail.info.uuid)) {
        detectedProviders = [...detectedProviders, providerDetail];
      }
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounceProvider);
    };
  });

  async function connectWallet(providerDetail) {
    isConnecting = true;
    try {
      const rawProvider = providerDetail ? providerDetail.provider : window.ethereum;
      if (!rawProvider) {
        alert("No se detectó ninguna wallet compatible. Por favor instala MetaMask o utiliza WalletConnect.");
        isConnecting = false;
        return;
      }

      const provider = new ethers.BrowserProvider(rawProvider);
      const accounts = await rawProvider.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      localStorage.setItem("accountAddress", address);
      localStorage.setItem("connectionType", "injected");
      userInfo.setKey("address", address);
      isLogin.set(true);
      isLoginPersistent.set(true);

      const balance = await checkTokenBalance(address);
      if (balance) {
        userInfo.setKey("balance", parseFloat(balance).toFixed(2));
      }

      showModal = false;
    } catch (error) {
      console.error("Error al conectar wallet:", error);
      alert("Error de conexión: " + (error.message || error));
    } finally {
      isConnecting = false;
    }
  }

  async function connectWalletConnect() {
    isConnecting = true;
    try {
      const provider = await EthereumProvider.init({
        projectId: walletConnectProjectId,
        chains: [8453],
        showQrModal: true,
        metadata: {
          name: "La Alquimia",
          description: "Trading Bots & Web3 Access",
          url: window.location.origin,
          icons: [window.location.origin + "/favicon.ico"],
        },
      });

      await provider.connect();

      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();
      const address = await signer.getAddress();

      localStorage.setItem("accountAddress", address);
      localStorage.setItem("connectionType", "walletconnect");
      userInfo.setKey("address", address);
      isLogin.set(true);
      isLoginPersistent.set(true);

      const balance = await checkTokenBalance(address);
      if (balance) {
        userInfo.setKey("balance", parseFloat(balance).toFixed(2));
      }

      showModal = false;
    } catch (error) {
      console.error("Error con WalletConnect:", error);
      alert("Error de WalletConnect: " + (error.message || error));
    } finally {
      isConnecting = false;
    }
  }

  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        showDropdown = false;
      }
    };

    document.addEventListener("click", handleClick, true);

    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }

  function copyAddress() {
    if ($userInfo.address) {
      navigator.clipboard.writeText($userInfo.address);
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }

  function disconnect() {
    localStorage.removeItem("accountAddress");
    localStorage.removeItem("connectionType");
    userInfo.setKey("address", "");
    userInfo.setKey("balance", 0);
    isLogin.set(false);
    isLoginPersistent.set(false);
    showDropdown = false;
    location.reload();
  }
</script>

<style>
  .wallet-pill {
    background: rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    padding: 3px 4px 3px 8px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    user-select: none;
  }

  @media (min-width: 640px) {
    .wallet-pill {
      padding: 3px 4px 3px 10px;
      gap: 8px;
    }
  }

  .wallet-pill:hover {
    background: rgba(255, 255, 255, 0.07);
    border-color: rgba(64, 205, 224, 0.35);
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35), 0 0 16px rgba(64, 205, 224, 0.12);
    transform: translateY(-1px);
  }

  .wallet-pill:active {
    transform: translateY(0);
  }

  .balance-chip {
    font-weight: 700;
    font-size: 12px;
    color: #e2e8f0;
    letter-spacing: 0.2px;
    display: none;
    align-items: center;
    gap: 5px;
  }

  @media (min-width: 640px) {
    .balance-chip {
      display: flex;
      font-size: 13px;
    }
  }

  .token-symbol {
    color: #34d399;
    font-size: 11px;
    font-weight: 800;
  }

  .address-badge {
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 9999px;
    padding: 2px 7px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 11px;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: background 0.2s;
  }

  @media (min-width: 640px) {
    .address-badge {
      font-size: 12px;
      padding: 3px 8px;
    }
  }

  .wallet-pill:hover .address-badge {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .chevron-icon {
    transition: transform 0.25s ease;
    color: #94a3b8;
  }

  .chevron-icon.rotated {
    transform: rotate(180deg);
    color: #40cde0;
  }

  /* Connect CTA button */
  .connect-btn {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(64, 205, 224, 0.35);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15);
    color: #fff;
    font-weight: 700;
    font-size: 12px;
    padding: 5px 12px;
    border-radius: 9999px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @media (min-width: 640px) {
    .connect-btn {
      font-size: 13px;
      padding: 7px 14px;
      gap: 6px;
    }
  }

  .connect-btn:hover {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(6, 182, 212, 0.3) 100%);
    border-color: rgba(64, 205, 224, 0.6);
    box-shadow: 0 6px 28px rgba(64, 205, 224, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }

  .connect-btn:active {
    transform: translateY(0);
  }

  /* Dropdown Popover */
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 260px;
    max-width: calc(100vw - 20px);
    background: rgba(13, 17, 28, 0.96);
    backdrop-filter: blur(24px) saturate(200%);
    -webkit-backdrop-filter: blur(24px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    border-radius: 18px;
    padding: 12px;
    z-index: 99999;
    animation: fadeInDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>

{#if $userInfo.address}
  <div class="relative inline-block text-left" use:clickOutside>
    <!-- Main Connected Pill Button -->
    <button
      type="button"
      on:click={() => (showDropdown = !showDropdown)}
      class="wallet-pill"
      aria-expanded={showDropdown}
    >
      <!-- Active Pulse & Balance on tablet/desktop -->
      <div class="balance-chip">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
        <span>{$userInfo.balance ? $userInfo.balance : "0.00"}</span>
        <span class="token-symbol">$ALQ</span>
      </div>

      <!-- Mobile Pulse Indicator (when balance is hidden) -->
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0 sm:hidden"></span>

      <!-- Address Capsule -->
      <div class="address-badge">
        <span>{$userInfo.address.slice(0, 4) + "..." + $userInfo.address.slice(-3)}</span>
        <svg
          class="w-3 h-3 sm:w-3.5 sm:h-3.5 chevron-icon"
          class:rotated={showDropdown}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Dropdown Menu -->
    {#if showDropdown}
      <div class="dropdown-menu">
        <!-- Top Status Row -->
        <div class="flex items-center justify-between px-2 py-1.5 mb-2 border-b border-white/5">
          <div class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="text-[11px] font-bold text-gray-300 uppercase tracking-wider">Conectado</span>
          </div>
          <span class="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40 font-semibold">
            Base
          </span>
        </div>

        <!-- Address Card & Actions -->
        <div class="bg-white/3 border border-white/5 rounded-xl p-2.5 mb-2.5 flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-gray-400">Dirección</span>
            <span class="text-[11px] font-mono text-gray-200">
              {$userInfo.address.slice(0, 6) + "..." + $userInfo.address.slice(-4)}
            </span>
          </div>

          <div class="flex items-center gap-1.5 pt-1 border-t border-white/5">
            <button
              type="button"
              on:click={copyAddress}
              class="flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium transition-colors"
            >
              {#if copied}
                <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="text-emerald-400 font-semibold">Copiado</span>
              {:else}
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copiar</span>
              {/if}
            </button>

            <a
              href="https://basescan.org/address/{$userInfo.address}"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-center p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-cyan-400 transition-colors"
              title="Ver en BaseScan"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Token Balance Row -->
        <div class="px-2.5 py-2 rounded-xl bg-gradient-to-r from-emerald-950/30 to-cyan-950/30 border border-emerald-800/30 mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <img src="/favicon.ico" alt="ALQ" class="w-4 h-4 rounded-full" />
            <span class="text-xs text-gray-300 font-medium">Saldo $ALQ</span>
          </div>
          <span class="font-mono font-bold text-sm text-emerald-400">
            {$userInfo.balance ? $userInfo.balance : "0.00"}
          </span>
        </div>

        <!-- Disconnect Button -->
        <button
          type="button"
          on:click={disconnect}
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-rose-400/90 hover:text-rose-300 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 hover:border-rose-700/50 transition-all duration-200"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Desconectar Wallet</span>
        </button>
      </div>
    {/if}
  </div>
{:else}
  <!-- Clean High-End Connect Button -->
  <button
    type="button"
    on:click={() => (showModal = true)}
    class="connect-btn"
  >
    <svg class="w-4 h-4 text-cyan-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
    <span>Conectar</span>
  </button>
{/if}

<!-- Modal de Conexión de Wallet con Diseño Premium -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    on:click={() => (showModal = false)}
  >
    <!-- Contenedor del Modal -->
    <div
      class="bg-gradient-to-b from-[#0f1422] to-[#090c14] border border-white/10 rounded-2xl w-full max-w-sm p-5 sm:p-6 shadow-2xl relative transform scale-100 transition-all duration-300"
      on:click|stopPropagation
    >
      <!-- Botón de Cerrar -->
      <button
        type="button"
        on:click={() => (showModal = false)}
        class="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Encabezado -->
      <div class="text-center mb-6">
        <div class="w-10 h-10 rounded-full bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white tracking-tight">Conecta tu Wallet</h3>
        <p class="text-xs text-gray-400 mt-1">Accede a las herramientas y bots de La Alquimia</p>
      </div>

      <!-- Lista de Métodos de Conexión -->
      <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
        <!-- 1. Botón de WalletConnect -->
        <button
          type="button"
          on:click={connectWalletConnect}
          disabled={isConnecting}
          class="w-full flex items-center justify-between p-3.5 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-cyan-500/40 rounded-xl transition-all duration-200 text-left group"
        >
          <div class="flex items-center space-x-3">
            <img
              src="https://raw.githubusercontent.com/WalletConnect/walletconnect-assets/master/Logo/Blue%20(Default)/Logo.svg"
              alt="WalletConnect"
              class="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform"
            />
            <div>
              <span class="text-white font-semibold text-sm block">
                WalletConnect
              </span>
              <span class="text-[10px] text-gray-400 block">
                QR Code, Trust, Rainbow, etc.
              </span>
            </div>
          </div>
          <span class="text-xs text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
            Conectar &rarr;
          </span>
        </button>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-white/5"></div>
          <span class="flex-shrink mx-3 text-gray-500 text-[10px] font-bold uppercase tracking-wider">Wallets del Navegador</span>
          <div class="flex-grow border-t border-white/5"></div>
        </div>

        <!-- 2. Wallets del Navegador Detectadas (EIP-6963) -->
        {#if detectedProviders.length > 0}
          {#each detectedProviders as providerDetail}
            <button
              type="button"
              on:click={() => connectWallet(providerDetail)}
              disabled={isConnecting}
              class="w-full flex items-center justify-between p-3.5 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-emerald-500/40 rounded-xl transition-all duration-200 text-left group"
            >
              <div class="flex items-center space-x-3">
                <img
                  src={providerDetail.info.icon}
                  alt={providerDetail.info.name}
                  class="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform"
                />
                <span class="text-gray-200 font-semibold text-sm group-hover:text-white">
                  {providerDetail.info.name}
                </span>
              </div>
              <span class="text-xs text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Detectada &rarr;
              </span>
            </button>
          {/each}
        {/if}

        <!-- Fallback a MetaMask / Inyección Genérica si no hay listados por EIP-6963 -->
        {#if window.ethereum && !detectedProviders.some(p => p.info.name.toLowerCase().includes("metamask"))}
          <button
            type="button"
            on:click={() => connectWallet(null)}
            disabled={isConnecting}
            class="w-full flex items-center justify-between p-3.5 bg-white/3 hover:bg-white/6 border border-white/8 hover:border-amber-500/40 rounded-xl transition-all duration-200 text-left group"
          >
            <div class="flex items-center space-x-3">
              <img
                src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                alt="MetaMask"
                class="w-8 h-8 group-hover:scale-105 transition-transform"
              />
              <span class="text-gray-200 font-semibold text-sm group-hover:text-white">
                Browser Wallet (MetaMask)
              </span>
            </div>
            <span class="text-xs text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Conectar &rarr;
            </span>
          </button>
        {/if}

        <!-- Si no se detecta ninguna wallet del navegador -->
        {#if !window.ethereum && detectedProviders.length === 0}
          <div class="text-center py-2 text-gray-500 text-xs">
            No se detectaron extensiones de wallet. Utiliza WalletConnect arriba para escanear código QR.
          </div>
        {/if}
      </div>

      {#if isConnecting}
        <div class="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400 mb-3"></div>
          <span class="text-sm font-semibold text-gray-200">Conectando...</span>
        </div>
      {/if}
    </div>
  </div>
{/if}
