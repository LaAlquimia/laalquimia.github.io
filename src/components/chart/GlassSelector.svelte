<script>
  import { onMount, onDestroy } from "svelte";

  export let id = "symbolSelector";
  export let className = "";
  export let defaultValue = "BTCUSDT";

  let hiddenSelect;
  let options = [];
  let sortedOptions = [];
  let filteredOptions = [];
  let selectedValue = defaultValue;
  let isOpen = false;
  let observer;

  // Search filter
  let searchQuery = "";
  let showSearch = false;
  let searchInputEl;

  const priorityCoins = ["BTC", "ETH", "SOL", "BNB"];

  function getPriorityIndex(symbol) {
    const upperSymbol = symbol.toUpperCase();
    for (let i = 0; i < priorityCoins.length; i++) {
      const coin = priorityCoins[i];
      if (upperSymbol.startsWith(coin)) {
        return i;
      }
    }
    return -1;
  }

  function sortOptions(opts) {
    return [...opts].sort((a, b) => {
      const idxA = getPriorityIndex(a.value);
      const idxB = getPriorityIndex(b.value);

      if (idxA !== -1 && idxB !== -1) {
        return idxA - idxB;
      }
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      return a.value.localeCompare(b.value);
    });
  }

  function syncOptions() {
    if (!hiddenSelect) return;
    const rawOptions = Array.from(hiddenSelect.options).map((opt) => ({
      value: opt.value,
      text: opt.textContent,
    }));

    if (rawOptions.length > 0) {
      options = rawOptions;
      sortedOptions = sortOptions(options);
      filterOptions();
      
      // Update selectedValue if hiddenSelect changed it
      if (hiddenSelect.value && hiddenSelect.value !== selectedValue) {
        selectedValue = hiddenSelect.value;
      }
    }
  }

  function filterOptions() {
    if (!searchQuery) {
      filteredOptions = sortedOptions;
    } else {
      const q = searchQuery.toLowerCase();
      filteredOptions = sortedOptions.filter((opt) =>
        opt.text.toLowerCase().includes(q)
      );
    }
  }

  $: {
    if (searchQuery !== undefined) {
      filterOptions();
    }
  }

  // Handle typing to trigger search when selector is open or focused
  function handleKeyDown(event) {
    if (!isOpen) return;

    // If key is a printable character and not Ctrl/Cmd/Alt, reveal search input
    if (
      event.key.length === 1 &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      if (!showSearch) {
        showSearch = true;
        searchQuery = "";
      }
      // Delay focus slightly so the element is rendered in Svelte DOM
      setTimeout(() => {
        if (searchInputEl) {
          searchInputEl.focus();
        }
      }, 10);
    } else if (event.key === "Escape") {
      closeDropdown();
    }
  }

  function toggleDropdown() {
    isOpen = !isOpen;
    if (!isOpen) {
      closeDropdown();
    }
  }

  function closeDropdown() {
    isOpen = false;
    showSearch = false;
    searchQuery = "";
  }

  function selectOption(value) {
    selectedValue = value;
    if (hiddenSelect) {
      hiddenSelect.value = value;
      // Dispatch change event to trigger the chart's vanilla JS event listener
      hiddenSelect.dispatchEvent(new Event("change", { bubbles: true }));
    }
    closeDropdown();
  }

  // Close when clicking outside
  function clickOutside(node) {
    const handleClick = (event) => {
      if (node && !node.contains(event.target) && !event.defaultPrevented) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClick, true);

    return {
      destroy() {
        document.removeEventListener("click", handleClick, true);
      },
    };
  }

  onMount(() => {
    // Initial sync
    syncOptions();

    // Observe changes to options in the hidden select (which scripts populate dynamically)
    observer = new MutationObserver(() => {
      syncOptions();
    });

    if (hiddenSelect) {
      observer.observe(hiddenSelect, { childList: true, subtree: true });
    }

    // Set up a window listener for keydowns when open
    window.addEventListener("keydown", handleKeyDown);
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
    window.removeEventListener("keydown", handleKeyDown);
  });
</script>

<div class="glass-selector-container {className}" use:clickOutside>
  <!-- Hidden select that matches exactly what vanilla JS scripts expect -->
  <select {id} bind:this={hiddenSelect} class="hidden-native-select">
    <slot />
  </select>

  <!-- Custom liquid glass button selector -->
  <button
    type="button"
    class="glass-trigger flex justify-between items-center"
    on:click={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span class="symbol-label">
      {selectedValue || "Seleccionar..."}
    </span>
    <span class="arrow-icon" class:rotated={isOpen}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  </button>

  <!-- Dropdown List with Liquid Glass Blur -->
  {#if isOpen}
    <div class="glass-dropdown">
      <!-- Search Input: Visible only when user starts typing -->
      {#if showSearch}
        <div class="search-container">
          <svg
            class="search-icon"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Buscar..."
            bind:value={searchQuery}
            bind:this={searchInputEl}
            class="search-input"
            on:blur={() => {
              if (searchQuery === "") {
                showSearch = false;
              }
            }}
          />
          <button
            type="button"
            class="clear-search"
            on:click|stopPropagation={() => {
              searchQuery = "";
              showSearch = false;
            }}
          >
            &times;
          </button>
        </div>
      {/if}

      <ul class="options-list" role="listbox">
        {#each filteredOptions as option}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <li
            class="option-item flex items-center justify-between"
            class:selected={option.value === selectedValue}
            on:click={() => selectOption(option.value)}
            role="option"
            aria-selected={option.value === selectedValue}
          >
            <span>{option.text}</span>
            {#if priorityCoins.includes(option.value.replace("USDT", ""))}
              <span class="priority-badge">{option.value.replace("USDT", "")}</span>
            {/if}
          </li>
        {:else}
          <li class="option-item empty-state text-center text-gray-400">
            Sin resultados
          </li>
        {/each}
      </ul>
      <div class="dropdown-tip text-center text-xs text-gray-500 py-1 border-t border-[rgba(255,255,255,0.05)]">
        Escribe para buscar
      </div>
    </div>
  {/if}
</div>

<style>
  .glass-selector-container {
    position: relative;
    display: inline-block;
    min-width: 160px;
    font-family: inherit;
    z-index: 9999;
  }

  .hidden-native-select {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  /* Liquid Glass Trigger Button */
  .glass-trigger {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    color: #fff;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2), 
                inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }

  .glass-trigger:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3),
                0 0 10px rgba(255, 255, 255, 0.1),
                inset 0 1px 1px rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .glass-trigger:active {
    transform: translateY(0);
  }

  .symbol-label {
    letter-spacing: 0.5px;
  }

  .arrow-icon {
    display: inline-flex;
    align-items: center;
    transition: transform 0.3s ease;
    opacity: 0.7;
  }

  .arrow-icon.rotated {
    transform: rotate(180deg);
    opacity: 1;
  }

  /* Liquid Glass Dropdown */
  .glass-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 99999;
    background: rgba(15, 20, 35, 0.95);
    backdrop-filter: blur(20px) saturate(190%);
    -webkit-backdrop-filter: blur(20px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
    overflow: hidden;
    animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Dynamic Search Bar */
  .search-container {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    animation: fadeIn 0.15s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .search-icon {
    color: rgba(255, 255, 255, 0.4);
    margin-right: 8px;
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #fff;
    font-size: 13px;
    padding: 4px 0;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }

  .clear-search {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    cursor: pointer;
    padding: 0 4px;
    transition: color 0.2s;
  }

  .clear-search:hover {
    color: #fff;
  }

  /* Options list */
  .options-list {
    list-style: none;
    padding: 6px;
    margin: 0;
    max-height: 250px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  .options-list::-webkit-scrollbar {
    width: 6px;
  }

  .options-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .options-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 10px;
  }

  .option-item {
    padding: 10px 14px;
    font-size: 13px;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
  }

  .option-item:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #fff;
    padding-left: 16px;
  }

  .option-item.selected {
    background: rgba(255, 255, 255, 0.12);
    color: #40cde0;
    font-weight: 700;
  }

  .priority-badge {
    background: rgba(64, 205, 224, 0.15);
    border: 1px solid rgba(64, 205, 224, 0.3);
    color: #40cde0;
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 6px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }

  .empty-state {
    padding: 20px;
    pointer-events: none;
  }
</style>
