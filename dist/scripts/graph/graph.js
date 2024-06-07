
const graph = async (series, symbol, emaSeries, volumeSeries) => {
    set_symbol(symbol);

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
    const emaDist = (numericValues[0] -ema[ema.length - 1]) / numericValues[0] * 100
    const emaData = datosConv1.slice(0, ema.length).map((entry, index) => ({
      time: entry.time,
      value: ema[index].toFixed(symbolDecimals),
    }));
    const distsData = ema.map((entry, index) => {
      const open = datosConv1[index].open;
      if (isNaN(open) || isNaN(entry) || open === 0) {
        return { emaDist: 0 }; // O cualquier valor predeterminado que desees
      }
      return { emaDist: (open - entry) / open };
    });
    const maxval = Math.max(...distsData.map(obj => obj.emaDist));
    const minval = Math.min(...distsData.map(obj => obj.emaDist));
    const volumeData = datosConv1.slice(0, datosConv1.length).map((entry, index) => ({
      time: entry.time,
      value: entry.volume,
    }));
    const umbdata = datosConv1.slice(0, datosConv1.length).map((entry, index) => ({
      time: entry.time,
      value:( ema[index]*(1+maxval)).toFixed(symbolDecimals),
    }));
    const umbdata2 = datosConv1.slice(0, datosConv1.length).map((entry, index) => ({
      time: entry.time,
      value: (ema[index]*(1+minval)).toFixed(symbolDecimals),
    }));
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
    chart.priceScale('right').applyOptions({autoScale : true}) 
    chart.timeScale().scrollToPosition(20 , false );
    volumeSeries.setData(volumeData);
    umbSeries.setData(umbdata);
    umbSeries2.setData(umbdata2);
    emaSeries.setData(emaData);
    series.setData(datosConv1);
    updateMarkers(symbol);
  
  
  }
const graphSeries = async (symbol) => {
    const symbolDecimals = await getDecimals(symbol);
    const container = document.getElementById('chart');

    const moveMin = Math.pow(10, -symbolDecimals).toString();

    chart = LightweightCharts.createChart(container, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      watermark: {
        visible: true,
        fontSize: 50  ,
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
      },
      layout: {
        fontSize: 24,
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
      }
      , priceScale: {
        autoScale: true,
      },
      localization: {
        locale: 'en-US',
        priceFormatter: (price) => {
          if (price < 0.001) return parseFloat(price).toFixed(symbolDecimals)
          else if (price >= 0.001 && price < 1) return parseFloat(price).toFixed(symbolDecimals)
          // else if (price >= 10) return parseFloat(price).toFixed(2)
        
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
    });
    umbSeries = chart.addLineSeries({
      color: 'rgba(191, 150, 74, 0.569)',
      lineWidth: 2,
    });
    umbSeries2 = chart.addLineSeries({
      color: 'rgba(74, 191, 113, 0.569)',
      lineWidth: 2,
    });
    volumeSeries = chart.addHistogramSeries({
      color: '#26a69984',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
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