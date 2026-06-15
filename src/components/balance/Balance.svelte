<script>
  import { onMount } from "svelte";
  import { ethers } from "ethers";
  import { userInfo, isLogin, isLoginPersistent } from "../../store.js";
  import { checkTokenBalance } from "../../scripts/login.js";
  import { EthereumProvider } from "@walletconnect/ethereum-provider";

  // Proyecto ID de WalletConnect. Se lee desde el archivo .env como PUBLIC_WALLETCONNECT_PROJECT_ID
  // Si no está definido, usa un ID público por defecto.
  const walletConnectProjectId = import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID || "95ff530dfcf95101a07010f3c5520e54";

  let showModal = false;
  let detectedProviders = [];
  let isConnecting = false;
  let showDropdown = false;

  // Cargar sesión persistente al montar el componente
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

    // Registrar detector de wallets inyectadas (EIP-6963)
    const handleAnnounceProvider = (event) => {
      const providerDetail = event.detail;
      // Evitar duplicados
      if (!detectedProviders.some(p => p.info.uuid === providerDetail.info.uuid)) {
        detectedProviders = [...detectedProviders, providerDetail];
      }
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounceProvider);
    // Solicitar a las wallets inyectadas que se anuncien
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounceProvider);
    };
  });

  // Conectar con un proveedor específico (MetaMask / Coinbase / Trust etc.)
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

  // Conectar usando WalletConnect (QR Code Modal)
  async function connectWalletConnect() {
    isConnecting = true;
    try {
      const provider = await EthereumProvider.init({
        projectId: walletConnectProjectId,
        chains: [8453], // Base Network (Mainnet)
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

  // Desconectar wallet
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

<!-- Botón Principal de Conexión o Estado del Usuario -->
{#if $userInfo.address}
  <div class="relative inline-block text-left select-none">
    <button
      on:click={() => (showDropdown = !showDropdown)}
      class="px-4 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-black border border-gray-700 hover:border-gray-500 text-gray-100 rounded-xl flex items-center space-x-2 shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
    >
      <img src="/favicon.ico" alt="tortuga" class="w-5 h-5 animate-pulse" />
      <span class="font-semibold text-sm">
        {$userInfo.balance ? `${$userInfo.balance} $ALQ` : "0.00 $ALQ"}
      </span>
      <span class="text-gray-500 font-bold">|</span>
      <span class="text-xs font-mono bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
        {$userInfo.address.slice(0, 5) + "..." + $userInfo.address.slice(-4)}
      </span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {#if showDropdown}
      <!-- Backdrop para cerrar menú al hacer clic fuera -->
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div class="fixed inset-0 z-20" on:click={() => (showDropdown = false)}></div>

      <div class="absolute right-0 mt-2 w-52 bg-gray-950 border border-gray-800 rounded-xl shadow-2xl z-30 overflow-hidden transform origin-top-right transition-all">
        <div class="p-3 border-b border-gray-900 bg-gray-900/40">
          <p class="text-xs text-gray-400">Wallet Conectada</p>
          <p class="text-xs font-mono text-gray-300 truncate mt-0.5">{$userInfo.address}</p>
        </div>
        <button
          on:click={disconnect}
          class="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition-colors duration-200"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Desconectar</span>
        </button>
      </div>
    {/if}
  </div>
{:else}
  <button
    on:click={() => (showModal = true)}
    class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
  >
    Conectar Wallet
  </button>
{/if}

<!-- Modal de Conexión de Wallet con Diseño Premium -->
{#if showModal}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300"
    on:click={() => (showModal = false)}
  >
    <!-- Contenedor del Modal -->
    <div
      class="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative transform scale-100 transition-all duration-300"
      on:click|stopPropagation
    >
      <!-- Botón de Cerrar -->
      <button
        on:click={() => (showModal = false)}
        class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Encabezado -->
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold text-white">Conecta tu Wallet</h3>
        <p class="text-xs text-gray-400 mt-1">Selecciona una opción para conectar tu wallet</p>
      </div>

      <!-- Lista de Métodos de Conexión -->
      <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
        <!-- 1. Botón de WalletConnect -->
        <button
          on:click={connectWalletConnect}
          disabled={isConnecting}
          class="w-full flex items-center justify-between p-3.5 bg-indigo-950/20 hover:bg-indigo-900/40 border border-indigo-900/50 hover:border-indigo-700/60 rounded-xl transition-all duration-200 text-left group"
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
          <span class="text-xs text-indigo-400 font-medium">
            Conectar
          </span>
        </button>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-gray-800"></div>
          <span class="flex-shrink mx-4 text-gray-600 text-xs font-semibold uppercase">Wallets del Navegador</span>
          <div class="flex-grow border-t border-gray-800"></div>
        </div>

        <!-- 2. Wallets del Navegador Detectadas (EIP-6963) -->
        {#if detectedProviders.length > 0}
          {#each detectedProviders as providerDetail}
            <button
              on:click={() => connectWallet(providerDetail)}
              disabled={isConnecting}
              class="w-full flex items-center justify-between p-3.5 bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 text-left group"
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
              <span class="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Detectada
              </span>
            </button>
          {/each}
        {/if}

        <!-- Fallback a MetaMask / Inyección Genérica si no hay listados por EIP-6963 -->
        {#if window.ethereum && !detectedProviders.some(p => p.info.name.toLowerCase().includes("metamask"))}
          <button
            on:click={() => connectWallet(null)}
            disabled={isConnecting}
            class="w-full flex items-center justify-between p-3.5 bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-gray-700 rounded-xl transition-all duration-200 text-left group"
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
            <span class="text-xs text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Conectar
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
        <div class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-2xl">
          <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
          <span class="text-sm font-semibold text-gray-300">Conectando...</span>
        </div>
      {/if}
    </div>
  </div>
{/if}
