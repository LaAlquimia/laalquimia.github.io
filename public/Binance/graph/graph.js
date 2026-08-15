
let activeChartWs = null;

const getBinanceInterval = (val) => {
  const mapping = {
    "1": "1m",
    "3": "3m",
    "5": "5m",
    "15": "15m",
    "30": "30m",
    "60": "1h",
    "120": "2h",
    "240": "4h",
    "360": "6h",
    "720": "12h",
    "D": "1d",
    "W": "1w",
    "M": "1M"
  };
  return mapping[val] || val;
};

const getIntervalSeconds = (val) => {
  const mapping = {
    "1": 60,
    "3": 180,
    "5": 300,
    "15": 900,
    "30": 1800,
    "60": 3600,
    "120": 7200,
    "240": 14400,
    "360": 21600,
    "720": 43200,
    "D": 86400,
    "W": 604800,
    "M": 2592000
  };
  return mapping[val] || 60;
};

const graph = async (series, symbol, emaSeries, volumeSeries) => {
  set_symbol(symbol);

  // Close previous active chart websocket if it exists
  if (activeChartWs) {
    try {
      activeChartWs.close();
    } catch (e) {}
    activeChartWs = null;
  }

  const binanceInterval = getBinanceInterval(interval);
  const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${binanceInterval}&limit=500`;
  const response = await fetch(url);
  const data = await response.json();
  const symbolDecimals = await getDecimals(symbol);
  const kline = data;
  
  let datosConv1 = convertirDatos(kline);
  
  signaltime = datosConv1[datosConv1.length - 20].time;
  const numericValues = kline.map(entry => parseFloat(entry[1]));
  
  let ema = EMA(numericValues.slice().reverse(), 59).reverse();
  const emaDist = (numericValues[0] - ema[ema.length - 1]) / numericValues[0] * 100;
  
  const emaData = datosConv1.slice(0, ema.length).map((entry, index) => ({
      time: entry.time,
      value: ema[index].toFixed(symbolDecimals),
  }));
  
  const distsData = ema.map((entry, index) => {
      const open = datosConv1[index].open;
      if (isNaN(open) || isNaN(entry) || open === 0) {
          return { emaDist: 0 };
      }
      return { emaDist: (open - entry) / open };
  });
  
  const maxval = Math.max(...distsData.map(obj => obj.emaDist));
  const minval = Math.min(...distsData.map(obj => obj.emaDist));

  const volumeData = datosConv1.map((entry, index) => ({
      time: entry.time,
      value: entry.volume,
  }));

  const umbdata = datosConv1.map((entry, index) => ({
      time: entry.time,
      value: (ema[index] * (1 + maxval)).toFixed(symbolDecimals),
  }));

  const umbdata2 = datosConv1.map((entry, index) => ({
      time: entry.time,
      value: (ema[index] * (1 + minval)).toFixed(symbolDecimals),
  }));

  // Verificación antes de usar chart
  if (!chart) {
      console.error("Error: chart no está definido.");
      return;
  }

  const isMobile = window.innerWidth < 640;
  chart.applyOptions({
      watermark: {
          visible: true,
          fontSize: isMobile ? 22 : 40,
          horzAlign: 'center',
          vertAlign: 'center',
          color: 'rgba(87, 112, 181, 0.25)',
          text: symbol + ' ' + emaDist.toFixed(2) + '%',
      },
      priceFormat: {
          type: 'custom',
          precision: symbolDecimals,
          minMove: Math.pow(10, -symbolDecimals).toString(),
      },
      priceScale: {
          autoScale: true,
      },
      localization: {
          locale: 'en-US',
          priceFormatter: (price) => {
              if (price < 0.001) return parseFloat(price).toFixed(symbolDecimals);
              else if (price >= 0.001 && price < 1) return parseFloat(price).toFixed(symbolDecimals);
              else return parseFloat(price).toFixed(symbolDecimals);
          }
      },
  });

  chart.priceScale('right').applyOptions({ 
    autoScale: true,
    minimumWidth: isMobile ? 65 : 85
  });
  chart.timeScale().scrollToPosition(10, false);

  volumeSeries.setData(volumeData);
  umbSeries.setData(umbdata);
  umbSeries2.setData(umbdata2);
  emaSeries.setData(emaData);
  series.setData(datosConv1);

  updateMarkers(symbol);

  // Set up real-time websocket updates using the trade-by-trade (aggTrade) stream
  try {
    const wsUrl = `wss://fstream.binance.com/market/ws/${symbol.toLowerCase()}@aggTrade`;
    activeChartWs = new WebSocket(wsUrl);

    activeChartWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (!msg || msg.e !== "aggTrade") return;

        const price = parseFloat(msg.p);
        const qty = parseFloat(msg.q);
        const tradeTime = msg.T; // milliseconds
        
        const intervalSecs = getIntervalSeconds(interval);
        const candleTime = Math.floor(tradeTime / 1000 / intervalSecs) * intervalSecs; // seconds timestamp

        let candleObj;
        const lastIndex = datosConv1.length - 1;

        if (lastIndex >= 0 && datosConv1[lastIndex].time === candleTime) {
          // Update current active candle
          const currentCandle = datosConv1[lastIndex];
          currentCandle.close = price;
          currentCandle.high = Math.max(currentCandle.high, price);
          currentCandle.low = Math.min(currentCandle.low, price);
          currentCandle.volume += qty;
          candleObj = currentCandle;
        } else {
          // A new candle time block has started, create a new candle
          const newCandle = {
            time: candleTime,
            open: price,
            high: price,
            low: price,
            close: price,
            volume: qty
          };
          datosConv1.push(newCandle);
          if (datosConv1.length > 500) {
            datosConv1.shift();
          }
          candleObj = newCandle;
        }

        // Update Lightweight Charts series in real-time
        series.update(candleObj);
        volumeSeries.update({ time: candleTime, value: candleObj.volume });

        // Recalculate indicators for the updated candle
        const numericValues = datosConv1.map(entry => entry.open);
        const emaArr = EMA(numericValues.slice().reverse(), 59).reverse();
        const lastEma = emaArr[emaArr.length - 1];
        
        const realTimeEmaDist = (price - lastEma) / price * 100;

        // Update watermark text
        chart.applyOptions({
          watermark: {
            text: symbol + ' ' + realTimeEmaDist.toFixed(2) + '%',
          }
        });

        // Update real-time indicator lines
        emaSeries.update({ time: candleTime, value: parseFloat(lastEma.toFixed(symbolDecimals)) });
        umbSeries.update({ time: candleTime, value: parseFloat((lastEma * (1 + maxval)).toFixed(symbolDecimals)) });
        umbSeries2.update({ time: candleTime, value: parseFloat((lastEma * (1 + minval)).toFixed(symbolDecimals)) });

      } catch (err) {
        console.error("Error updating real-time chart via aggTrade:", err);
      }
    };

    activeChartWs.onerror = (err) => {
      console.error("Active chart WebSocket error:", err);
    };

  } catch (wsError) {
    console.error("Could not initialize active chart WebSocket:", wsError);
  }
};

const graphSeries = async (symbol) => {
    const symbolDecimals = await getDecimals(symbol);
    const container = document.getElementById('chart');

    const moveMin = Math.pow(10, -symbolDecimals).toString();

    const isMobile = window.innerWidth < 640;
    chart = LightweightCharts.createChart(container, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      watermark: {
        visible: true,
        fontSize: isMobile ? 22 : 40,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.35)',
        text: 'La Alquimia',
      },
      timeScale: {
        timeVisible: true,
        autoScale: true,
        borderColor: 'rgba(255,255,255,0.08)',
        rightOffset: 12,
      },
  
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.08)',
        minimumWidth: isMobile ? 65 : 85,
      },
      layout: {
        fontSize: isMobile ? 11 : 13,
        fontFamily: 'Outfit, -apple-system, BlinkMacSystemFont, sans-serif',
        background: {
          type: 'solid',
          color: 'transparent',
        },
        textColor: '#cbd5e1',
      },
      grid: {
        horzLines: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        vertLines: {
          color: 'rgba(255, 255, 255, 0.03)',
        },
      },
    });

    chart.applyOptions({
      handleScale: {
        axisPressedMouseMove: {
          time: false,
          price: false,
        },
      },

      priceFormat: {
        type: 'custom',
        precision: symbolDecimals,
        minMove: moveMin,
      }
      , priceScale: {
        autoScale: true,
      },
      localization: {
        locale: 'en-US',
        priceFormatter: (price) => {
          if (price < 0.001) return parseFloat(price).toFixed(symbolDecimals)
          else if (price >= 0.001 && price < 1) return parseFloat(price).toFixed(symbolDecimals)
          else return parseFloat(price).toFixed(symbolDecimals)
        }
      },
    });
    series = chart.addCandlestickSeries({
      upColor: 'rgb(38,166,154)',
      downColor: 'rgb(255,82,82)',
      wickUpColor: 'rgb(38,166,154)',
      wickDownColor: 'rgb(255,82,82)',
      borderVisible: false,
    });
    emaSeries = chart.addLineSeries({
      color: 'rgba(74, 80, 191, 0.569)',
      lineWidth: 2,
      lastValueVisible: false,
    });
    umbSeries = chart.addLineSeries({
      color: 'rgba(191, 150, 74, 0.569)',
      lineWidth: 2,
      lastValueVisible: false,
    });
    umbSeries2 = chart.addLineSeries({
      color: 'rgba(74, 191, 113, 0.569)',
      lineWidth: 2,
      lastValueVisible: false,
    });
    volumeSeries = chart.addHistogramSeries({
      color: '#26a69984',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      lastValueVisible: false,
    });    
    chart.priceScale('').applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    
  });
    new ResizeObserver(entries => {
      if (entries.length === 0 || entries[0].target !== container) { return; }
      const newRect = entries[0].contentRect;
      chart.applyOptions({ height: newRect.height, width: newRect.width });
    }).observe(container);

    
    graph(series, symbol, emaSeries, volumeSeries);
  };


const getMarkers = (symbol) => {
  const signals = loadSignalsBySymbol(symbol);
  const markers = signals.map(signal => {
    return {
      time: signal.time,
      position: (signal['singalType'] === 1 ? 'belowBar' : 'aboveBar'),
      color: (signal['singalType'] === 1 ? 'green' : 'red'),
      shape: (signal['singalType'] === 1 ? 'arrowUp' : 'arrowDown'),
      text: (signal['singalType'] === 1 ? '🐢 LONG@' : '🐢 SHORT@')+ signal.price,
      fontSize: '24',
    };
  });
  return markers;
};

const updateMarkers = (symbol) => {
  series.setMarkers([]);
  const markers = getMarkers(symbol);
  series.setMarkers(markers);
};

const getDecimals = async (symbol) => {
  const decimals = binanceMarketInfo.find(market => market.symbol === symbol).pricePrecision
  return decimals
};