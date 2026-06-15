<script>
  import { onMount, onDestroy } from "svelte";
  import { checkBalances } from "../bots/botBalance.js";
  import GlassSelector from "./GlassSelector.svelte";

  // Balance checking state
  let balances = {};
  let nft3Balance = 0;
  let loadingBalance = true;

  // Selected coin and state
  let selectedSymbol = "ETHUSDT";
  let activeSymbolData = null;
  let isScanning = false;
  let scanProgress = 0;
  let scanTotal = 0;

  // Strategy values for UI
  let stats = {
    spread: 0,
    delta: 0,
    deltaPrev: 0,
    acceleration: 0,
    score: 0,
    scorePrev: 0,
    rvol: 0,
    oiCurrent: 0,
    oiPrev: 0,
    oiChangePct: 0,
    macroDirection: false, // EMA50 > EMA200 (1H)
    macroSupport: false,   // Price > EMA200 (1H)
    macroBandwidth: 0,
    macroBandwidthPrev: 0,
    macroBandwidthP20: 0,
    macroAntiChoppy: false,
    macroEnabled: false,
    signal: "NEUTRAL",
    sl: 0,
    entryPrice: 0
  };

  // Checklist verification
  $: checklist = {
    macroTrend: stats.macroEnabled,
    confirmGiro: stats.delta > 0 && stats.deltaPrev < 0,
    inercia: stats.acceleration > 0,
    momentum: stats.score > 0 && stats.score > stats.scorePrev,
    confirmPrice: activeSymbolData ? (activeSymbolData.close > activeSymbolData.ema20) : false,
    rvol: stats.rvol > 1.5,
    capitalFlow: stats.oiCurrent > stats.oiPrev
  };

  $: isLongTriggered = 
    checklist.macroTrend &&
    checklist.confirmGiro &&
    checklist.inercia &&
    checklist.momentum &&
    checklist.confirmPrice &&
    checklist.rvol &&
    checklist.capitalFlow;

  // Scanned results list
  let scanResults = [];
  let signalLogs = [];

  // WebSocket and chart variables
  let chartContainer;
  let chart;
  let candleSeries;
  let ema20Series;
  let ema50Series;
  let volumeSeries;
  let activeWs = null;
  let loopInterval = null;

  const hotTokens = ["ETHUSDT", "SOLUSDT", "WIFUSDT", "PEPEUSDT", "BONKUSDT", "BTCUSDT", "BOMEUSDT", "FTMUSDT", "XRPUSDT", "AVAXUSDT"];

  // Helper Math functions
  function EMA(data, period) {
    const k = 2 / (period + 1);
    let ema = [];
    if (data.length === 0) return ema;
    let sum = 0;
    for (let i = 0; i < Math.min(period, data.length); i++) {
      sum += data[i];
    }
    let prev = sum / Math.min(period, data.length);
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        ema.push(data[i]);
      } else {
        const val = data[i] * k + prev * (1 - k);
        ema.push(val);
        prev = val;
      }
    }
    return ema;
  }

  function SMA(data, period) {
    let sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        let sum = 0;
        for (let j = 0; j <= i; j++) sum += data[j];
        sma.push(sum / (i + 1));
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) sum += data[i - j];
        sma.push(sum / period);
      }
    }
    return sma;
  }

  function WMA3(data) {
    let wma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < 2) {
        wma.push(data[i]);
      } else {
        wma.push((3 * data[i] + 2 * data[i - 1] + data[i - 2]) / 6);
      }
    }
    return wma;
  }

  function ATR(candles, period = 14) {
    let tr = [];
    if (candles.length === 0) return [];
    tr.push(candles[0].high - candles[0].low);
    for (let i = 1; i < candles.length; i++) {
      const h = candles[i].high;
      const l = candles[i].low;
      const pc = candles[i - 1].close;
      tr.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
    
    let atr = [];
    let sum = 0;
    for (let i = 0; i < Math.min(period, candles.length); i++) {
      sum += tr[i];
    }
    let prevAtr = sum / Math.min(period, candles.length);
    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        atr.push(tr[i]);
      } else {
        const val = (prevAtr * (period - 1) + tr[i]) / period;
        atr.push(val);
        prevAtr = val;
      }
    }
    return atr;
  }

  function BollingerBands(data, period = 20, multiplier = 2) {
    let bb = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        bb.push({ middle: data[i], upper: data[i], lower: data[i], bandwidth: 0 });
        continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[i - j];
      const mean = sum / period;
      
      let variance = 0;
      for (let j = 0; j < period; j++) variance += Math.pow(data[i - j] - mean, 2);
      const stdDev = Math.sqrt(variance / period);
      
      const upper = mean + multiplier * stdDev;
      const lower = mean - multiplier * stdDev;
      const bandwidth = mean !== 0 ? (upper - lower) / mean : 0;
      bb.push({ middle: mean, upper, lower, bandwidth });
    }
    return bb;
  }

  onMount(async () => {
    try {
      balances = await checkBalances();
      nft3Balance = parseInt(balances[3] || 0);
    } catch (error) {
      console.error("Error al obtener balances:", error);
    } finally {
      loadingBalance = false;
    }

    if (nft3Balance > 0 || true) { // For testing/dev we allow viewing
      await initChart();
      await updateData();
      startWebSocket();
      
      // Auto scan tokens
      triggerScan();

      loopInterval = setInterval(async () => {
        await updateData();
        triggerScan();
      }, 60000);
    }
  });

  onDestroy(() => {
    if (activeWs) activeWs.close();
    if (loopInterval) clearInterval(loopInterval);
  });

  async function getDecimals(symbol) {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/instruments-info?category=linear&symbol=${symbol}`);
      const data = await response.json();
      return parseInt(data.result.list[0].priceScale);
    } catch (e) {
      return 4;
    }
  }

  async function fetchKlines(symbol, interval, limit = 200) {
    const response = await fetch(`https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`);
    const data = await response.json();
    if (!data.result || !data.result.list) return [];
    return data.result.list.map(arr => ({
      time: parseInt(parseFloat(arr[0]) / 1000),
      open: parseFloat(arr[1]),
      high: parseFloat(arr[2]),
      low: parseFloat(arr[3]),
      close: parseFloat(arr[4]),
      volume: parseFloat(arr[5])
    })).reverse();
  }

  async function fetchOpenInterest(symbol, limit = 5) {
    try {
      const response = await fetch(`https://api.bybit.com/v5/market/open-interest?category=linear&symbol=${symbol}&intervalTime=5min&limit=${limit}`);
      const data = await response.json();
      if (!data.result || !data.result.list) return [];
      return data.result.list;
    } catch (e) {
      return [];
    }
  }

  async function calculateStrategyForCoin(symbol) {
    try {
      const [klines5M, klines1H, oiList] = await Promise.all([
        fetchKlines(symbol, "5", 100),
        fetchKlines(symbol, "60", 250),
        fetchOpenInterest(symbol, 5)
      ]);

      if (klines5M.length < 50 || klines1H.length < 210) return null;

      // 1. 1H Macro Filter
      const closePrices1H = klines1H.map(k => k.close);
      const ema50_1H = EMA(closePrices1H, 50);
      const ema200_1H = EMA(closePrices1H, 200);
      const bb_1H = BollingerBands(closePrices1H, 20, 2);

      const last1HClose = closePrices1H[closePrices1H.length - 1];
      const lastEma50_1H = ema50_1H[ema50_1H.length - 1];
      const lastEma200_1H = ema200_1H[ema200_1H.length - 1];
      const lastBB_1H = bb_1H[bb_1H.length - 1];
      const prevBB_1H = bb_1H[bb_1H.length - 2];

      // Calculate historical bandwidths to get the 20th percentile
      const bandwidths = bb_1H.map(b => b.bandwidth).slice(20);
      bandwidths.sort((a, b) => a - b);
      const percentile20 = bandwidths[Math.floor(bandwidths.length * 0.2)] || 0;

      const macroDirection = lastEma50_1H > lastEma200_1H;
      const macroSupport = last1HClose > lastEma200_1H;
      const macroAntiChoppy = lastBB_1H.bandwidth > prevBB_1H.bandwidth || lastBB_1H.bandwidth > percentile20;
      const macroEnabled = macroDirection && macroSupport && macroAntiChoppy;

      // 2. 5M Trigger Metrics
      const closePrices5M = klines5M.map(k => k.close);
      const volumes5M = klines5M.map(k => k.volume);
      
      const ema20_5M = EMA(closePrices5M, 20);
      const ema50_5M = EMA(closePrices5M, 50);
      const smaVol20 = SMA(volumes5M, 20);
      const atr5M = ATR(klines5M, 14);

      // Construct vectors for Spread, Delta, Acceleration, Score
      const spreads = [];
      for (let i = 0; i < klines5M.length; i++) {
        spreads.push(ema20_5M[i] - ema50_5M[i]);
      }

      const deltas = [0];
      for (let i = 1; i < spreads.length; i++) {
        deltas.push(spreads[i] - spreads[i - 1]);
      }

      const rawAccelerations = [0, 0];
      for (let i = 2; i < deltas.length; i++) {
        rawAccelerations.push(deltas[i] - deltas[i - 1]);
      }

      const accelerations = WMA3(rawAccelerations);

      const scores = [];
      for (let i = 0; i < klines5M.length; i++) {
        const atr = atr5M[i];
        if (atr === 0) {
          scores.push(0);
        } else {
          scores.push((spreads[i] / atr) * accelerations[i]);
        }
      }

      // RVOL
      const lastVol = volumes5M[volumes5M.length - 1];
      const lastSmaVol20 = smaVol20[smaVol20.length - 1];
      const rvol = lastSmaVol20 !== 0 ? lastVol / lastSmaVol20 : 0;

      // Open Interest
      const oiCurrent = oiList && oiList[0] ? parseFloat(oiList[0].openInterest) : 0;
      const oiPrev = oiList && oiList[1] ? parseFloat(oiList[1].openInterest) : 0;
      const oiChangePct = oiPrev !== 0 ? ((oiCurrent - oiPrev) / oiPrev) * 100 : 0;

      // Current values
      const len = klines5M.length;
      const spread = spreads[len - 1];
      const delta = deltas[len - 1];
      const deltaPrev = deltas[len - 2];
      const acceleration = accelerations[len - 1];
      const score = scores[len - 1];
      const scorePrev = scores[len - 2];

      const currentPrice = closePrices5M[len - 1];
      const currentAtr = atr5M[len - 1];
      const sl = currentPrice - (currentAtr * 1.5);

      // Check signal
      let signal = "NEUTRAL";
      
      const cond_macro = macroEnabled;
      const cond_giro = delta > 0 && deltaPrev < 0;
      const cond_inercia = acceleration > 0;
      const cond_momentum = score > 0 && score > scorePrev;
      const cond_price = currentPrice > ema20_5M[len - 1];
      const cond_rvol = rvol > 1.5;
      const cond_oi = oiCurrent > oiPrev;

      if (cond_macro && cond_giro && cond_inercia && cond_momentum && cond_price && cond_rvol && cond_oi) {
        signal = "LONG 🟢";
      }

      return {
        symbol,
        price: currentPrice,
        spread,
        delta,
        deltaPrev,
        acceleration,
        score,
        scorePrev,
        rvol,
        oiCurrent,
        oiPrev,
        oiChangePct,
        macroDirection,
        macroSupport,
        macroBandwidth: lastBB_1H.bandwidth,
        macroBandwidthPrev: prevBB_1H.bandwidth,
        macroBandwidthP20: percentile20,
        macroAntiChoppy,
        macroEnabled,
        signal,
        sl,
        ema20: ema20_5M[len - 1],
        ema50: ema50_5M[len - 1],
        klines: klines5M.map((k, idx) => ({
          ...k,
          ema20: ema20_5M[idx],
          ema50: ema50_5M[idx]
        }))
      };
    } catch (e) {
      console.error("Error calculating strategy for " + symbol, e);
      return null;
    }
  }

  async function updateData() {
    const data = await calculateStrategyForCoin(selectedSymbol);
    if (!data) return;

    stats = {
      spread: data.spread,
      delta: data.delta,
      deltaPrev: data.deltaPrev,
      acceleration: data.acceleration,
      score: data.score,
      scorePrev: data.scorePrev,
      rvol: data.rvol,
      oiCurrent: data.oiCurrent,
      oiPrev: data.oiPrev,
      oiChangePct: data.oiChangePct,
      macroDirection: data.macroDirection,
      macroSupport: data.macroSupport,
      macroBandwidth: data.macroBandwidth,
      macroBandwidthPrev: data.macroBandwidthPrev,
      macroBandwidthP20: data.macroBandwidthP20,
      macroAntiChoppy: data.macroAntiChoppy,
      macroEnabled: data.macroEnabled,
      signal: data.signal,
      sl: data.sl,
      entryPrice: data.price
    };

    activeSymbolData = data;

    // Update charts
    if (chart) {
      const decimals = await getDecimals(selectedSymbol);
      
      chart.applyOptions({
        watermark: {
          text: `${selectedSymbol} (5M) Score: ${data.score.toFixed(4)}`,
        }
      });

      const chartData = data.klines;
      candleSeries.setData(chartData);
      
      ema20Series.setData(chartData.map(k => ({ time: k.time, value: k.ema20 })));
      ema50Series.setData(chartData.map(k => ({ time: k.time, value: k.ema50 })));
      
      volumeSeries.setData(chartData.map(k => ({
        time: k.time,
        value: k.volume,
        color: k.close >= k.open ? "rgba(38,166,154,0.5)" : "rgba(255,82,82,0.5)"
      })));

      // Add signal marker if long triggered
      if (data.signal.includes("LONG")) {
        const logExists = signalLogs.find(l => l.symbol === selectedSymbol && l.time === chartData[chartData.length - 1].time);
        if (!logExists) {
          const newSignal = {
            symbol: selectedSymbol,
            time: chartData[chartData.length - 1].time,
            price: data.price,
            score: data.score,
            rvol: data.rvol,
            timestamp: new Date().toLocaleTimeString()
          };
          signalLogs = [newSignal, ...signalLogs];
          speakAlert(`Alquialerta: Compra en largo detectada en ${selectedSymbol}`);
        }
      }

      // Update markers
      const symbolSignals = signalLogs.filter(s => s.symbol === selectedSymbol);
      const markers = symbolSignals.map(s => ({
        time: s.time,
        position: 'belowBar',
        color: '#10b981',
        shape: 'arrowUp',
        text: `LONG @ ${s.price}`,
        fontSize: 16
      }));
      candleSeries.setMarkers(markers);
    }
  }

  function speakAlert(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }
  }

  async function triggerScan() {
    isScanning = true;
    scanTotal = hotTokens.length;
    scanProgress = 0;
    let tempResults = [];

    for (let symbol of hotTokens) {
      const res = await calculateStrategyForCoin(symbol);
      if (res) {
        tempResults.push({
          symbol: res.symbol,
          price: res.price,
          score: res.score,
          rvol: res.rvol,
          oiChangePct: res.oiChangePct,
          macro: res.macroEnabled ? "Bullish 🟢" : "Choppy/Bear 🔴",
          signal: res.signal
        });
      }
      scanProgress++;
    }

    scanResults = tempResults.sort((a, b) => b.score - a.score);
    isScanning = false;
  }

  function startWebSocket() {
    if (activeWs) {
      activeWs.close();
    }
    const wsUrl = `wss://stream.bybit.com/v5/public/linear`;
    activeWs = new WebSocket(wsUrl);

    activeWs.onopen = () => {
      activeWs.send(JSON.stringify({
        op: "subscribe",
        args: [`kline.5.${selectedSymbol}`]
      }));
    };

    activeWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg || msg.topic !== `kline.5.${selectedSymbol}` || !msg.data || msg.data.length === 0) return;

        const klineData = msg.data[0];
        const open = parseFloat(klineData.open);
        const high = parseFloat(klineData.high);
        const low = parseFloat(klineData.low);
        const close = parseFloat(klineData.close);
        const volume = parseFloat(klineData.volume);
        const candleTime = klineData.start / 1000;

        const updatedCandle = {
          time: candleTime,
          open,
          high,
          low,
          close,
          volume
        };

        if (activeSymbolData && candleSeries) {
          const klines = activeSymbolData.klines;
          const lastIndex = klines.length - 1;

          if (lastIndex >= 0 && klines[lastIndex].time === candleTime) {
            klines[lastIndex] = { ...klines[lastIndex], ...updatedCandle };
          } else {
            klines.push(updatedCandle);
            if (klines.length > 200) klines.shift();
          }

          // Recalculate indicators on the fly
          const closePrices = klines.map(k => k.close);
          const ema20Arr = EMA(closePrices, 20);
          const ema50Arr = EMA(closePrices, 50);
          
          const lastEma20 = ema20Arr[ema20Arr.length - 1];
          const lastEma50 = ema50Arr[ema50Arr.length - 1];

          candleSeries.update({
            ...updatedCandle,
            ema20: lastEma20,
            ema50: lastEma50
          });

          ema20Series.update({ time: candleTime, value: lastEma20 });
          ema50Series.update({ time: candleTime, value: lastEma50 });
          volumeSeries.update({
            time: candleTime,
            value: volume,
            color: close >= open ? "rgba(38,166,154,0.5)" : "rgba(255,82,82,0.5)"
          });
        }
      } catch (err) {
        console.error("WebSocket update err:", err);
      }
    };
  }

  async function initChart() {
    if (!chartContainer) return;
    
    if (typeof window.LightweightCharts === 'undefined') {
      await new Promise(resolve => {
        const check = () => {
          if (typeof window.LightweightCharts !== 'undefined') resolve();
          else setTimeout(check, 50);
        };
        check();
      });
    }
    
    chart = window.LightweightCharts.createChart(chartContainer, {
      width: chartContainer.offsetWidth,
      height: 400,
      layout: {
        background: { type: 'solid', color: '#090a0f' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: 'Outfit, sans-serif'
      },
      grid: {
        horzLines: { color: 'rgba(255,255,255,0.03)' },
        vertLines: { color: 'rgba(255,255,255,0.03)' }
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        autoScale: true
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        timeVisible: true
      },
      watermark: {
        visible: true,
        fontSize: 32,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(255, 255, 255, 0.02)',
        text: 'La Alquimia Quant'
      }
    });

    candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
      borderVisible: false
    });

    ema20Series = chart.addLineSeries({
      color: '#06b6d4',
      lineWidth: 1.5,
      title: 'EMA 20'
    });

    ema50Series = chart.addLineSeries({
      color: '#8b5cf6',
      lineWidth: 1.5,
      title: 'EMA 50'
    });

    volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
      lastValueVisible: false
    });

    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });

    new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== chartContainer) return;
      const { width } = entries[0].contentRect;
      chart.resize(width, 400);
    }).observe(chartContainer);
  }

  function handleSelectSymbol(symbol) {
    selectedSymbol = symbol;
    updateData();
    startWebSocket();
  }
</script>

<style>
  .trader-panel {
    background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent),
                radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.05), transparent);
  }

  .glass-card {
    background: rgba(13, 15, 24, 0.6);
    backdrop-filter: blur(24px) saturate(190%);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 16px 40px 0 rgba(0, 0, 0, 0.5),
                inset 0 1px 1px rgba(255, 255, 255, 0.03);
    border-radius: 24px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .glass-card:hover {
    border-color: rgba(6, 182, 212, 0.2);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6),
                0 0 24px rgba(6, 182, 212, 0.08);
  }

  .glow-green {
    box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
  }

  .glow-cyan {
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
  }

  .glow-violet {
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
  }

  /* Glass tables */
  .gtable {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 8px;
  }

  .gtable th {
    padding: 12px 16px;
    font-weight: 600;
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .gtable tr.trow {
    background: rgba(255, 255, 255, 0.015);
    transition: all 0.2s ease;
  }

  .gtable tr.trow:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .gtable td {
    padding: 14px 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    color: #e2e8f0;
    font-size: 13px;
  }

  .gtable td:first-child {
    border-left: 1px solid rgba(255, 255, 255, 0.03);
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  .gtable td:last-child {
    border-right: 1px solid rgba(255, 255, 255, 0.03);
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
</style>

<!-- if token balance is valid -->
{#if nft3Balance > 0 || true}
<div class="trader-panel text-white py-12 px-6 lg:px-12 w-full min-h-screen">
  <div class="max-w-7xl mx-auto flex flex-col gap-10">

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
      <div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 text-xs font-semibold tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 rounded-full">QUANT V2 FÚTURES</span>
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span class="text-xs text-gray-400">Bybit Conexión Activa</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          Algoritmo Score de Expansión
        </h1>
        <p class="text-gray-400 text-sm mt-1">Medias de Inercia, Flujo de Capital (Open Interest) y Volumen Relativo (RVOL).</p>
      </div>

      <!-- Quick Selector -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400 font-medium">Activo:</span>
        <GlassSelector id="traderCoinSelector" defaultValue={selectedSymbol} on:change={(e) => handleSelectSymbol(e.target.value)}>
          {#each hotTokens as tok}
            <option value={tok}>{tok}</option>
          {/each}
        </GlassSelector>
      </div>
    </div>

    <!-- Scanner Progress Bar -->
    {#if isScanning}
    <div class="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <div class="flex justify-between items-center text-xs text-cyan-400 font-semibold">
        <span>Escaneando el Mercado...</span>
        <span>{scanProgress} / {scanTotal} Tokens</span>
      </div>
      <div class="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300" style="width: {(scanProgress / scanTotal) * 100}%"></div>
      </div>
    </div>
    {/if}

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Chart Column -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="glass-card p-6 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-gray-200">{selectedSymbol}</span>
              <span class="text-xs text-cyan-400 font-semibold border border-cyan-800 bg-cyan-950/30 px-2 py-0.5 rounded">5M</span>
            </div>
            <div class="flex items-center gap-4 text-sm">
              <span class="text-gray-400">SL Calculado: <b class="text-rose-400">${stats.sl.toFixed(4)}</b></span>
              <span class="text-gray-400">Precio: <b class="text-white">${stats.entryPrice.toFixed(4)}</b></span>
            </div>
          </div>
          
          <div class="rounded-xl overflow-hidden border border-white/5 bg-black/60 relative">
            <div bind:this={chartContainer} class="w-full" style="height: 400px;"></div>
          </div>
          
          <!-- Indicator Legends -->
          <div class="flex flex-wrap gap-6 text-xs text-gray-400 mt-2">
            <div class="flex items-center gap-2">
              <span class="w-3 h-1 bg-cyan-500 rounded"></span>
              <span>EMA 20 (Rápida)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-1 bg-violet-500 rounded"></span>
              <span>EMA 50 (Lenta)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 bg-emerald-500/30 border border-emerald-500/50 rounded"></span>
              <span>Ruptura Volumen (>1.5 RVOL)</span>
            </div>
          </div>
        </div>

        <!-- Scanner / Watchlist -->
        <div class="glass-card p-6 flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-200">Scanner Multiactivo</h3>
            <button class="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all rounded-lg glow-violet" on:click={triggerScan} disabled={isScanning}>
              {isScanning ? "Escaneando..." : "Escanear Ahora"}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="gtable">
              <thead>
                <tr>
                  <th class="text-left">Symbol</th>
                  <th class="text-right">Precio</th>
                  <th class="text-right">Macro Trend</th>
                  <th class="text-right">RVOL</th>
                  <th class="text-right">Capital OI %</th>
                  <th class="text-right">Score 5M</th>
                  <th class="text-right">Gatillo</th>
                </tr>
              </thead>
              <tbody>
                {#each scanResults as item}
                  <tr class="trow cursor-pointer" on:click={() => handleSelectSymbol(item.symbol)}>
                    <td class="font-bold text-cyan-400">{item.symbol}</td>
                    <td class="text-right font-mono">${item.price.toFixed(4)}</td>
                    <td class="text-right text-xs">{item.macro}</td>
                    <td class="text-right font-mono {item.rvol > 1.5 ? 'text-emerald-400 font-bold' : 'text-gray-400'}">{item.rvol.toFixed(2)}</td>
                    <td class="text-right font-mono {item.oiChangePct > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                      {item.oiChangePct > 0 ? '+' : ''}{item.oiChangePct.toFixed(2)}%
                    </td>
                    <td class="text-right font-mono font-bold {item.score > 0 ? 'text-cyan-400' : 'text-gray-500'}">{item.score.toFixed(4)}</td>
                    <td class="text-right">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold {item.signal.includes('LONG') ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400 animate-pulse' : 'bg-white/5 border border-white/10 text-gray-400'}">
                        {item.signal}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Checklist and Strategy Metrics Column -->
      <div class="flex flex-col gap-6">
        
        <!-- Checklist Card -->
        <div class="glass-card p-6 flex flex-col gap-6 border-l-4 border-cyan-500">
          <div>
            <h3 class="text-lg font-bold text-gray-200">Gatillo Institucional (5M)</h3>
            <p class="text-xs text-gray-400">Verificación de condiciones de entrada al cierre de la vela actual.</p>
          </div>

          <div class="flex flex-col gap-4">
            <!-- 1 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.macroTrend ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.macroTrend ? 'text-emerald-400' : 'text-gray-300'}">1. Alineación Macro (1H)</span>
                <span class="text-[10px] text-gray-400">EMA50 > EMA200, Precio > EMA200 y Bollinger Bandwidth > Percentil 20</span>
              </div>
              <span class="text-xs font-bold {checklist.macroTrend ? 'text-emerald-400' : 'text-rose-400'}">{checklist.macroTrend ? 'Apto' : 'Lateralizado'}</span>
            </div>

            <!-- 2 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.confirmGiro ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.confirmGiro ? 'text-emerald-400' : 'text-gray-300'}">2. Confirmación de Giro</span>
                <span class="text-[10px] text-gray-400">Delta 5M > 0 y Delta Anterior &lt; 0</span>
              </div>
              <span class="text-xs font-bold {checklist.confirmGiro ? 'text-emerald-400' : 'text-rose-400'}">{checklist.confirmGiro ? 'Giro 🟢' : 'Esperando'}</span>
            </div>

            <!-- 3 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.inercia ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.inercia ? 'text-emerald-400' : 'text-gray-300'}">3. Inercia a Favor</span>
                <span class="text-[10px] text-gray-400">Aceleración 5M > 0</span>
              </div>
              <span class="text-xs font-bold {checklist.inercia ? 'text-emerald-400' : 'text-rose-400'}">{checklist.inercia ? 'Creciente' : 'Bajando'}</span>
            </div>

            <!-- 4 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.momentum ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.momentum ? 'text-emerald-400' : 'text-gray-300'}">4. Score de Expansión</span>
                <span class="text-[10px] text-gray-400">Score 5M > 0 y mayor que vela anterior</span>
              </div>
              <span class="text-xs font-bold {checklist.momentum ? 'text-emerald-400' : 'text-rose-400'}">{checklist.momentum ? 'Expansión' : 'Débil'}</span>
            </div>

            <!-- 5 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.confirmPrice ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.confirmPrice ? 'text-emerald-400' : 'text-gray-300'}">5. Confirmación de Precio</span>
                <span class="text-[10px] text-gray-400">Precio de cierre > EMA 20 (5M)</span>
              </div>
              <span class="text-xs font-bold {checklist.confirmPrice ? 'text-emerald-400' : 'text-rose-400'}">{checklist.confirmPrice ? 'Por Encima' : 'Por Debajo'}</span>
            </div>

            <!-- 6 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.rvol ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.rvol ? 'text-emerald-400' : 'text-gray-300'}">6. Filtro Volumen Relativo</span>
                <span class="text-[10px] text-gray-400">RVOL > 1.5 (Volumen de vela > 50% promedio)</span>
              </div>
              <span class="text-xs font-bold {checklist.rvol ? 'text-emerald-400' : 'text-rose-400'}">{checklist.rvol ? 'Ruptura' : 'Bajo Volumen'}</span>
            </div>

            <!-- 7 -->
            <div class="flex items-center justify-between p-3 rounded-xl {checklist.capitalFlow ? 'bg-emerald-950/20 border border-emerald-900/50' : 'bg-white/2 border border-white/5'}">
              <div class="flex flex-col">
                <span class="text-xs font-semibold {checklist.capitalFlow ? 'text-emerald-400' : 'text-gray-300'}">7. Flujo de Capital (Open Interest)</span>
                <span class="text-[10px] text-gray-400">Open Interest actual > Open Interest anterior</span>
              </div>
              <span class="text-xs font-bold {checklist.capitalFlow ? 'text-emerald-400' : 'text-rose-400'}">{checklist.capitalFlow ? 'Inyección Capital' : 'Sin Flujo'}</span>
            </div>
          </div>

          <!-- Final Signal Box -->
          <div class="p-4 rounded-xl text-center border font-bold {isLongTriggered ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 glow-green' : 'bg-white/5 border-white/10 text-gray-400'}">
            {isLongTriggered ? "¡COMPRA EN LARGO CONFIRMADA! 🟢" : "SIN SEÑAL ACTIVA ⚪"}
          </div>
        </div>

        <!-- Strategy Details / Mathematical Metrics -->
        <div class="glass-card p-6 flex flex-col gap-4">
          <h3 class="text-lg font-bold text-gray-200">Métricas Cuánticas (5M)</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Spread (EMA20-EMA50)</span>
              <span class="text-base font-mono font-bold text-white mt-1 block">{stats.spread.toFixed(4)}</span>
            </div>
            
            <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Delta (Velocidad)</span>
              <span class="text-base font-mono font-bold mt-1 block {stats.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                {stats.delta > 0 ? '+' : ''}{stats.delta.toFixed(4)}
              </span>
            </div>

            <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Aceleración (Suavizada)</span>
              <span class="text-base font-mono font-bold mt-1 block {stats.acceleration > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                {stats.acceleration > 0 ? '+' : ''}{stats.acceleration.toFixed(4)}
              </span>
            </div>

            <div class="p-3 bg-white/2 rounded-xl border border-white/5 text-center">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Score Expansión</span>
              <span class="text-base font-mono font-bold mt-1 block {stats.score > 0 ? 'text-cyan-400' : 'text-gray-400'}">
                {stats.score.toFixed(4)}
              </span>
            </div>
          </div>

          <div class="border-t border-white/5 pt-4 flex flex-col gap-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">RVOL:</span>
              <span class="font-mono text-white">{stats.rvol.toFixed(2)}x</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">OI Actual:</span>
              <span class="font-mono text-white">{stats.oiCurrent.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Cambio OI:</span>
              <span class="font-mono {stats.oiChangePct > 0 ? 'text-emerald-400' : 'text-rose-400'}">
                {stats.oiChangePct > 0 ? '+' : ''}{stats.oiChangePct.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <!-- Signal History / Alerts -->
        <div class="glass-card p-6 flex flex-col gap-4">
          <h3 class="text-lg font-bold text-gray-200">Alertas Recientes</h3>
          <div class="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {#each signalLogs as log}
              <div class="flex justify-between items-center p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs">
                <div>
                  <b class="text-emerald-400">{log.symbol}</b>
                  <span class="text-gray-400"> - LONG @ {log.price.toFixed(4)}</span>
                </div>
                <span class="text-gray-500 font-mono text-[10px]">{log.timestamp}</span>
              </div>
            {:else}
              <p class="text-xs text-gray-500 text-center py-4">Esperando señales...</p>
            {/each}
          </div>
        </div>

      </div>

    </div>

  </div>
</div>
{:else}
<div class="flex items-center justify-center min-h-screen text-white bg-[#090a0f] p-6">
  <div class="glass-card p-8 max-w-md text-center flex flex-col items-center gap-4">
    <h2 class="text-xl font-bold text-rose-400">Acceso Restringido</h2>
    <p class="text-sm text-gray-400">Requiere propiedad del NFT del Bot 3 en OpenSea para activar el Algoritmo Score de Expansión.</p>
    <a class="px-6 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-sm font-semibold transition-all mt-2" href="https://opensea.io/assets/base/0xd78be833ed889929b50d2ad3ab7ba94f76a9a8bf/3" target="_blank">Comprar NFT en OpenSea</a>
  </div>
</div>
{/if}

