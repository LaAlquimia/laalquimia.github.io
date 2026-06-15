let activeChartWs = null;

const graph = async (series, symbol, emaSeries, volumeSeries) => {
    set_symbol(symbol);

    // Close previous active chart websocket if it exists
    if (activeChartWs) {
      try {
        activeChartWs.close();
      } catch (e) {}
      activeChartWs = null;
    }

    const url = `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=1000`;
    const response = await fetch(url);
    const data = await response.json();
    const symbolDecimals = await getDecimals(symbol);
    const kline = data.result.list;
    
    const datosConv1 = convertirDatos(kline);
    // set signal to last item in datosConv1
    signaltime = datosConv1[datosConv1.length - 20].time;
    const numericValues = kline.map(entry => parseFloat(entry[1]));
    const ema = EMA(numericValues, 59).reverse();
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

    chart.applyOptions({
      watermark: {
        visible: true,
        fontSize: 60,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(87, 112, 181, 0.308)',
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
      minimumWidth: 180
    });
    chart.timeScale().scrollToPosition(20, false);
    volumeSeries.setData(volumeData);
    umbSeries.setData(umbdata);
    umbSeries2.setData(umbdata2);
    emaSeries.setData(emaData);
    series.setData(datosConv1);
    updateMarkers(symbol);

    // Set up real-time websocket updates using the Bybit v5 public linear kline stream
    try {
      const wsUrl = `wss://stream.bybit.com/v5/public/linear`;
      activeChartWs = new WebSocket(wsUrl);

      activeChartWs.onopen = () => {
        activeChartWs.send(JSON.stringify({
          op: "subscribe",
          args: [`kline.${interval}.${symbol}`]
        }));
      };

      activeChartWs.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (!msg || msg.topic !== `kline.${interval}.${symbol}` || !msg.data || msg.data.length === 0) return;

          const klineData = msg.data[0];
          const open = parseFloat(klineData.open);
          const high = parseFloat(klineData.high);
          const low = parseFloat(klineData.low);
          const close = parseFloat(klineData.close);
          const volume = parseFloat(klineData.volume);
          const startMs = klineData.start; // milliseconds

          const candleTime = startMs / 1000; // seconds

          let candleObj = {
            time: candleTime,
            open: open,
            high: high,
            low: low,
            close: close,
            volume: volume
          };

          const lastIndex = datosConv1.length - 1;
          if (lastIndex >= 0 && datosConv1[lastIndex].time === candleTime) {
            datosConv1[lastIndex] = candleObj;
          } else {
            datosConv1.push(candleObj);
            if (datosConv1.length > 1000) {
              datosConv1.shift();
            }
          }

          // Update Lightweight Charts series in real-time
          series.update(candleObj);
          volumeSeries.update({ time: candleTime, value: volume });

          // Recalculate indicators for the updated candle
          const numericValues = datosConv1.map(entry => entry.open).reverse();
          const emaArr = EMA(numericValues, 59).reverse();
          const lastEma = emaArr[emaArr.length - 1];
          
          const realTimeEmaDist = (close - lastEma) / close * 100;

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
          console.error("Error updating real-time chart via Bybit WebSocket:", err);
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

    chart = LightweightCharts.createChart(container, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      watermark: {
        visible: true,
        fontSize: 50,
        horzAlign: 'center',
        vertAlign: 'center',
        color: 'rgba(171, 71, 188, 0.5)',
        text: 'La Alquimia',
      },
      timeScale: {
        timeVisible: true,
        autoScale: true,
        borderColor: '#D1D4DC',
        rightOffset: 20,
      },
  
      rightPriceScale: {
        borderColor: '#D1D4DC',
        minimumWidth: 180,
      },
      layout: {
        fontSize: 24,
        fontFamily: 'Courier New, monospace',
        background: {
          type: 'solid',
          color: '#000',
        },
        textColor: '#FFFFFF',
      },
      grid: {
        horzLines: {
          color: '#ffffff20',
        },
        vertLines: {
          color: '#f0f3fa1a',
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
  const url = `https://api.bybit.com/v5/market/instruments-info?category=linear&symbol=${symbol}` ;
  const response = await fetch(url);
  const data = await response.json();
  // convert to integer
  return parseInt(data.result.list[0].priceScale);
};