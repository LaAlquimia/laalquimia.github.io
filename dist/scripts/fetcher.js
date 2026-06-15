/* eslint-disable @typescript-eslint/no-unused-vars */



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







const tradeableCoins = async () => {
  const coinsResponse = await fetch('https://api.bybit.com/v5/market/instruments-info?category=linear')

  const coinsData = await coinsResponse.json()

  const coins = coinsData.result.list.filter(coin => coin.status === 'Trading').map(coin => coin.symbol)
  return coins
}
const updateProgressBar = (current, total) => {
  let bar = document.getElementById('loading-bar-container');
  let label = document.getElementById('loading-bar-label');
  if (!bar) {
    const parent = document.getElementById('tables');
    if (!parent) return;
    
    label = document.createElement('div');
    label.id = 'loading-bar-label';
    label.style.cssText = 'font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 4px; font-weight: 500; display: flex; justify-content: space-between; width: 100%;';
    label.innerHTML = '<span>Escaneando mercado...</span><span id="loading-bar-text">0%</span>';
    
    bar = document.createElement('div');
    bar.id = 'loading-bar-container';
    bar.style.cssText = 'width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; margin-bottom: 15px; overflow: hidden; position: relative;';
    
    const fill = document.createElement('div');
    fill.id = 'loading-bar-fill';
    fill.style.cssText = 'height: 100%; background: linear-gradient(90deg, #40cde0, #a5b1f4); width: 0%; transition: width 0.2s ease;';
    bar.appendChild(fill);
    
    // Insert right after the Filters header
    const firstChild = parent.firstElementChild;
    if (firstChild && firstChild.nextSibling) {
      parent.insertBefore(label, firstChild.nextSibling);
      parent.insertBefore(bar, firstChild.nextSibling.nextSibling);
    } else {
      parent.appendChild(label);
      parent.appendChild(bar);
    }
  }
  
  const fill = document.getElementById('loading-bar-fill');
  const labelText = document.getElementById('loading-bar-text');
  
  if (fill && labelText) {
    const pct = Math.min(100, Math.round((current / total) * 100));
    fill.style.width = pct + '%';
    labelText.textContent = `${current}/${total} (${pct}%)`;
    
    if (current >= total) {
      setTimeout(() => {
        if (bar) bar.style.display = 'none';
        if (label) label.style.display = 'none';
      }, 1500);
    } else {
      bar.style.display = 'block';
      label.style.display = 'flex';
    }
  }
};

const analyzeCoins = async () => {
  const coins = await tradeableCoins();
  const total = coins.length;
  let current = 0;
  const results = [];

  const updateTables = () => {
    const positiveDF = results.filter(({ EMA_dist }) => EMA_dist > 0).sort((a, b) => b.EMA_dist - a.EMA_dist);
    const negativeDF = results.filter(({ EMA_dist }) => EMA_dist < 0).sort((a, b) => a.EMA_dist - b.EMA_dist);
    populateTable('positiveTable', positiveDF.slice(0, 10));
    populateTable('negativeTable', negativeDF.slice(0, 10));
  };

  updateProgressBar(0, total);

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < coins.length; i += batchSize) {
    const batch = coins.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (coin) => {
        try {
          const res = await fetchKline(coin);
          results.push(res);
        } catch (e) {
          console.error(`Error scanning ${coin}:`, e);
        } finally {
          current++;
        }
      })
    );
    updateProgressBar(current, total);
    updateTables();
  }
};
const convertirDatos = (datos) => {
  return datos.map(arr => ({
    time: parseInt(parseFloat(arr[0]) / 1000),
    open: parseFloat(arr[1]),
    high: parseFloat(arr[2]),
    low: parseFloat(arr[3]),
    close: parseFloat(arr[4]),
    volume: parseFloat(arr[5])
  })).reverse()
}
const fetchTickers = async () => {
  const response = await fetch('https://api.bybit.com//v5/market/tickers?category=linear')
  const data = await response.json()
  tickers = data.result.list
  return data.result.list
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
  console.log(kline);
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
  // const rsi2 = calculateRSI(ordered.map(entry => entry.open), 28);
  const emafx = emaDist.toFixed(2)
  if (rsi[0] < rsi[1] && rsi[1] > 75 && emaDist > 3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2);
    const signalMessage = 'SHORT ⛔' + symbol + '\nEMA distance: ' + emafx + '%\n 24h PriceChange ' + (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2) + ' % ';
    const speech = 'Alquialerta: Short' + symbol + 'Distancia a la media' + emafx + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
    saveSignal(symbol,ordered[0].time, 2, ordered[0].open, emafx);
  } else if (rsi[0] > rsi[1] && rsi[1] < 25 && emaDist < -3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2);
    const signalMessage = 'LONG 🟢' + symbol + '\nEMA distance ' + emafx + '%\n24h PriceChange ' + percent + '% ';
    const speech = 'Alquialerta long' + symbol + 'Distancia a la media' + emafx + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
    saveSignal(symbol,ordered[0].time, 1, ordered[0].open, emafx);
    
  }
}

// symbol or 'BTCUSDT'
const zscore = async (symbol  = 'BTCUSDT' ) => {
  const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1`
  const response = await fetch(url)
  const data = await response.json()
  const kline = data.result.list
  const numericValues = kline.map(entry => parseFloat(entry[1]))
  const ema = EMA(numericValues, 59)
  const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100

  // Calcular la media de los precios de cierre
  const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;

  // Calcular la desviación estándar de los precios de cierre
  const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numericValues.length;
  const stdDeviation = Math.sqrt(variance);

  // Calcular el z-score actual
  const zScore = (numericValues[0] - mean) / stdDeviation;

  // Generar bandas de z-score (por ejemplo, +/- 2 desviaciones estándar)
  const upperBand = mean + (2 * stdDeviation);
  const lowerBand = mean - (2 * stdDeviation);
  const price24hPcnt = (parseFloat(tickers.find(ticker => ticker.symbol === symbol).price24hPcnt) * 100).toFixed(2)
  return { symbol, EMA_dist: emaDist, price24hPcnt, zScore, upperBand, lowerBand }
}
