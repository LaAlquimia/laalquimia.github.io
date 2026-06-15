/* eslint-disable @typescript-eslint/no-unused-vars */

const BinanceApi = 'https://fapi.binance.com/'
const marketInfo = 'fapi/v1/exchangeInfo'
const h24Ticker = 'fapi/v1/ticker/24hr'

let ws = null;
let candleCache = {};
let topCoins = [];
let cachedBinanceCoins = null;
let loopCount = 0;

function calculateRSI(closes, period) {
  const rsis = [];
  const gains = [];
  const losses = [];

  for (let i = 0; i < closes.length; i++) {
    const diff = closes[i] - closes[i + 1];
    if (diff > 0) {
      gains.push(diff);
      losses.push(0);
    } else {
      gains.push(0);
      losses.push(Math.abs(diff));
    }
  }

  for (let i = 0; i < closes.length; i++) {
    if (i >= closes.length - period) {
      rsis.push(0);
    } else {
      const avgGain = gains.slice(i, i + period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i, i + period).reduce((a, b) => a + b, 0) / period;
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsis.push(rsi);
    }
  }
  return rsis;
}

const BinanceTradeableCoins = async () => {
  if (cachedBinanceCoins) return cachedBinanceCoins;
  try {
    const coinsResponse = await fetch(BinanceApi + marketInfo)
    const data = await coinsResponse.json()
    const symbols = data.symbols
    cachedBinanceCoins = symbols.filter(coin => coin.status === 'TRADING').map(coin => coin.symbol)
    return cachedBinanceCoins
  } catch (error) {
    console.error("Error fetching tradeable coins:", error);
    return [];
  }
}

const initWebSocket = async () => {
  if (ws) {
    try {
      ws.close();
    } catch (e) {}
  }

  try {
    // 1. Fetch latest 24hr tickers to select the top 50 by volume
    const tickerResponse = await fetch(BinanceApi + h24Ticker);
    tickers = await tickerResponse.json();

    const coins = await BinanceTradeableCoins();
    if (!coins || coins.length === 0) return;

    const coinsWithVolume = coins.map(coin => {
      const ticker = tickers.find(t => t.symbol === coin);
      return {
        symbol: coin,
        volume: ticker ? parseFloat(ticker.quoteVolume || 0) : 0
      };
    });

    topCoins = coinsWithVolume
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 50)
      .map(c => c.symbol);

    console.log("Starting WebSocket scanner for top 50 coins by volume:", topCoins);

    // 2. Establish the WebSocket connection FIRST so we start receiving live data immediately
    const streams = topCoins.map(coin => `${coin.toLowerCase()}@kline_1m`).join('/');
    ws = new WebSocket(`wss://fstream.binance.com/market/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg || !msg.data) return;

        const symbol = msg.data.s;
        const k = msg.data.k;
        const isClosed = k.x;

        const updatedCandle = [
          k.t,                  // Open time
          parseFloat(k.o),      // Open
          parseFloat(k.h),      // High
          parseFloat(k.l),      // Low
          parseFloat(k.c),      // Close
          parseFloat(k.v)       // Volume
        ];

        if (!candleCache[symbol]) {
          candleCache[symbol] = [];
        }

        const cache = candleCache[symbol];
        if (cache.length > 0) {
          const lastCandle = cache[cache.length - 1];
          if (lastCandle[0] === k.t) {
            // Update current active candle in-place
            cache[cache.length - 1] = updatedCandle;
          } else {
            // A new candle has started
            cache.push(updatedCandle);
            if (cache.length > 150) {
              cache.shift();
            }
          }
        } else {
          cache.push(updatedCandle);
        }

        // Trigger signal check only when the candle closes to ensure stable indicators
        if (isClosed && cache.length >= 59) {
          const numericValues = cache.map(entry => entry[1]); // open prices
          const ema = EMA(numericValues.slice().reverse(), 59);
          const currentPrice = numericValues[numericValues.length - 1];
          const emaDist = ((currentPrice - ema[0]) / currentPrice) * 100;
          
          signals(cache, symbol, emaDist);
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket scanner disconnected. Reconnecting in 5s...");
      setTimeout(initWebSocket, 5000);
    };

    ws.onerror = (err) => {
      console.error("WebSocket scanner error:", err);
    };

    // 3. Fetch historical klines in the background slowly (1 coin every 2000ms)
    // This runs asynchronously in the background and does not block the WebSocket or the UI
    (async () => {
      for (const symbol of topCoins) {
        try {
          const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=150`;
          const response = await fetch(url);
          const data = await response.json();
          if (Array.isArray(data)) {
            const historical = data.map(c => [
              c[0], // time
              parseFloat(c[1]), // open
              parseFloat(c[2]), // high
              parseFloat(c[3]), // low
              parseFloat(c[4]), // close
              parseFloat(c[5])  // volume
            ]);

            // Merge with any real-time candles already collected by the WebSocket
            if (!candleCache[symbol] || candleCache[symbol].length === 0) {
              candleCache[symbol] = historical;
            } else {
              const liveCandles = candleCache[symbol];
              const firstLiveTime = liveCandles[0][0];
              // Filter out historical candles that are newer than or equal to the first live candle
              const filteredHistorical = historical.filter(c => c[0] < firstLiveTime);
              candleCache[symbol] = [...filteredHistorical, ...liveCandles].slice(-150);
            }
          }
        } catch (e) {
          console.error(`Error loading history for ${symbol}:`, e);
        }
        // Sleep 2000ms between calls to guarantee we don't trigger the API rate limit on startup
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      console.log("All historical candles loaded successfully.");
    })();

  } catch (error) {
    console.error("Error initializing WebSocket scanner:", error);
    setTimeout(initWebSocket, 10000);
  }
}

const analyzeCoins = async () => {
  console.log("Binance (WS-backed Scanner)");
  try {
    // 1. Fetch latest 24hr tickers to update prices and volumes (Only 1 API request per minute)
    const tickerResponse = await fetch(BinanceApi + h24Ticker)
    tickers = await tickerResponse.json()

    // 2. Initialize WebSocket if it hasn't been started
    if (!ws) {
      await initWebSocket();
      return;
    }

    // 3. Periodically re-evaluate the top 50 most active coins (every 30 minutes)
    loopCount++;
    if (loopCount % 30 === 0) {
      await initWebSocket();
      return;
    }

    // 4. Calculate indicators from local cache
    const results = [];
    for (const symbol of topCoins) {
      const cache = candleCache[symbol];
      if (cache && cache.length >= 59) {
        const numericValues = cache.map(entry => entry[1]); // Open prices
        const ema = EMA(numericValues.slice().reverse(), 59);
        const currentPrice = numericValues[numericValues.length - 1];
        const emaDist = ((currentPrice - ema[0]) / currentPrice) * 100;
        
        const ticker = tickers.find(t => t.symbol === symbol);
        const price24hPcnt = ticker ? parseFloat(ticker.priceChangePercent || 0).toFixed(2) : "0.00";
        
        results.push({ symbol, EMA_dist: emaDist, price24hPcnt });
      }
    }

    // 5. Update UI Tables
    const positiveDF = results.filter(({ EMA_dist }) => EMA_dist > 0).sort((a, b) => b.EMA_dist - a.EMA_dist)
    const negativeDF = results.filter(({ EMA_dist }) => EMA_dist < 0).sort((a, b) => a.EMA_dist - b.EMA_dist)
    
    populateTable('positiveTable', positiveDF.slice(0, 10))
    populateTable('negativeTable', negativeDF.slice(0, 10))
  } catch (error) {
    console.error("Error in analyzeCoins scanner:", error);
  }
}

const convertirDatos = (datos) => {
  return datos.map(arr => ({
    time: parseInt(parseFloat(arr[0]) / 1000),
    open: parseFloat(arr[1]),
    high: parseFloat(arr[2]),
    low: parseFloat(arr[3]),
    close: parseFloat(arr[4]),
    volume: parseFloat(arr[5])
  }));
}

const fetchTickers = async () => {
  const response = await fetch('https://api.bybit.com//v5/market/tickers?category=linear')
  const data = await response.json()
  tickers = data.result.list
  return data.result.list
}

const fetchBinanceMarketInfo = async () => {
  const response = await fetch(BinanceApi + marketInfo)
  const data = await response.json()
  const symbols = data.symbols
  const tickerResponse = await fetch(BinanceApi + h24Ticker)
  const tickerData = await tickerResponse.json()
  binanceMarketInfo = symbols
  tickers = tickerData
  return symbols
}

const FetchBinaceKline = async (symbol) => {
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=1m&limit=150`
    const response = await fetch(url)
    const data = await response.json()
    const kline = data
    if (!Array.isArray(kline)) return { symbol, EMA_dist: 0, price24hPcnt: 0 };
    const numericValues = kline.map(entry => parseFloat(entry[1]))
    const ema = EMA(numericValues.reverse(), 59)
    const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100
    signals(kline, symbol, emaDist);
    
    const price24hPcnt = parseFloat(
      tickers.find(ticker => ticker.symbol === symbol)?.priceChangePercent || 0
    ).toFixed(2);
    
    return { symbol, EMA_dist: emaDist, price24hPcnt }
  } catch (error) {
    console.error(`Error fetching klines for ${symbol}:`, error);
    return { symbol, EMA_dist: 0, price24hPcnt: 0 };
  }
}

const fetchKline = async (symbol) => {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1`
  const response = await fetch(url)
  const data = await response.json()
  const kline = data.result.list
  const numericValues = kline.map(entry => parseFloat(entry[1]))
  const ema = EMA(numericValues, 59)
  const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100
  signals(kline, symbol, emaDist)
  const price24hPcnt = (parseFloat(tickers.find(ticker => ticker.symbol === symbol).price24hPcnt) * 100).toFixed(2)

  return { symbol, EMA_dist: emaDist, price24hPcnt }
}

const fetchKlineDev = async (symbol) => {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1&limit=200`
  const response = await fetch(url)
  const data = await response.json()
  const kline = data.result.list
  const numericValues = kline.map(entry => parseFloat(entry[1]))
  const ema = EMA(numericValues, 59)
  return { symbol, ema }
}

const signals = (kLine, symbol, emaDist) => {
  const ordered = convertirDatos(kLine).reverse();
  const rsi = RSI(ordered.map(entry => entry.open), 28);
  const emafx = emaDist.toFixed(2)
  
  const ticker = tickers ? tickers.find(t => t.symbol === symbol) : null;
  const percent = ticker ? parseFloat(ticker.priceChangePercent || 0).toFixed(2) : "0.00";
  
  if (rsi[0] < rsi[1] && rsi[1] > 75 && emaDist > 3) {
    const signalMessage = 'SHORT ⛔' + symbol + '\nEMA distance: ' + emafx + '%\n 24h PriceChange ' + percent + ' % ';
    const speech = 'Alquialerta: Short' + symbol + 'Distancia a la media' + emafx + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
    saveSignal(symbol, ordered[0].time, 2, ordered[0].open, emafx);
  } else if (rsi[0] > rsi[1] && rsi[1] < 25 && emaDist < -3) {
    const signalMessage = 'LONG 🟢' + symbol + '\nEMA distance ' + emafx + '%\n24h PriceChange ' + percent + '% ';
    const speech = 'Alquialerta long' + symbol + 'Distancia a la media' + emafx + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
    saveSignal(symbol, ordered[0].time, 1, ordered[0].open, emafx);
  }
}

const zscore = async (symbol = 'BTCUSDT') => {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1`
  const response = await fetch(url)
  const data = await response.json()
  const kline = data.result.list
  const numericValues = kline.map(entry => parseFloat(entry[1]))
  const ema = EMA(numericValues, 59)
  const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100

  const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

  const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
  const stdDeviation = Math.sqrt(variance);

  const zScore = (numericValues[0] - mean) / stdDeviation;

  const upperBand = mean + (2 * stdDeviation);
  const lowerBand = mean - (2 * stdDeviation);
  const price24hPcnt = (parseFloat(tickers.find(ticker => ticker.symbol === symbol).price24hPcnt) * 100).toFixed(2)
  return { symbol, EMA_dist: emaDist, price24hPcnt, zScore, upperBand, lowerBand }
}
