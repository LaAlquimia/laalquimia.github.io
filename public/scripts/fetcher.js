const analyzeCoins = async () => {
    const coinsResponse = await fetch('https://api.bybit.com/v5/market/instruments-info?category=linear');
    const coinsData = await coinsResponse.json();
    const tickers = await fetchTickers()
    const coins = coinsData.result.list.filter(coin => coin.status === 'Trading').map(coin => coin.symbol);
    const results = await Promise.all(coins.map(coin => fetchKline(coin)));
    const positiveDF = results.filter(({ EMA_dist }) => EMA_dist > 0).sort((a, b) => b.EMA_dist - a.EMA_dist);
    const negativeDF = results.filter(({ EMA_dist }) => EMA_dist < 0).sort((a, b) => a.EMA_dist - b.EMA_dist);
    populateTable('positiveTable', positiveDF.slice(0, 10));
    populateTable('negativeTable', negativeDF.slice(0, 10));
  };
  const  convertirDatos = (datos) => {
    return datos.map(arr => ({
      time: parseInt(parseFloat(arr[0]) / 1000),
      open: parseFloat(arr[1]),
      high: parseFloat(arr[2]),
      low: parseFloat(arr[3]),
      close: parseFloat(arr[4]),
      volume: parseFloat(arr[5]),
    })).reverse();
  };
const fetchTickers = async () => {
    const response = await fetch('https://api.bybit.com//v5/market/tickers?category=linear');
    const data = await response.json();
    tickers = data.result.list
    return data.result.list;
  };

  const fetchKline = async (symbol) => {
    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=1`;
    const response = await fetch(url);
    const data = await response.json();
    const kline = data.result.list;
    const numericValues = kline.map(entry => parseFloat(entry[1]));
    const ema = EMA(numericValues, 59);
    const emaDist = ((numericValues[0] - ema[0]) / numericValues[0]) * 100;
    signals(kline, symbol, emaDist);
    const price24hPcnt =  (parseFloat(tickers.find(ticker => ticker.symbol === symbol).price24hPcnt)*100).toFixed(2);
    return { symbol, EMA_dist: emaDist, price24hPcnt };
  };