/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */

var chart = null;
var series = null;
var emaSeries = null;
var umbSeries = null;
var umbSeries2 = null;
var volumeSeries = null;
var longSymbols = [];
var shortSymbols = [];
var tickers = null;
var signal_count = null;
var interval = '1';
var gSymbol = 'BTCUSDT'

const set_symbol = (symbol) => {
  gSymbol = symbol;
}

const signals = (kLine, symbol, emaDist) => {
  const ordered = convertirDatos(kLine).reverse();
  const rsi = RSI(ordered.map(entry => entry.open), 28);
  if (rsi[0] < rsi[1] && rsi[1] > 75 && emaDist > 3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2);
    const signalMessage = 'SHORT ⛔' + symbol + '\nEMA distance: ' + emaDist.toFixed(2) + '%\n 24h PriceChange ' + (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2) + ' % ';
    const speech = 'Alquialerta: Short' + symbol + 'Distancia a la media' + emaDist.toFixed(2) + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
  } else if (rsi[0] > rsi[1] && rsi[1] < 25 && emaDist < -3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt * 100).toFixed(2);
    const signalMessage = 'LONG 🟢' + symbol + '\nEMA distance ' + emaDist.toFixed(2) + '%\n24h PriceChange ' + percent + '% ';
    const speech = 'Alquialerta long' + symbol + 'Distancia a la media' + emaDist.toFixed(2) + '%';
    speak(speech);
    notifyMe(symbol, signalMessage);
  }
}
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser.');
    return;
  }

  if (Notification.permission !== 'granted')
    Notification.requestPermission();
});


const loopFunction = () => {
  analyzeCoins();
  const currentSymbol = gSymbol;
  graph(series, currentSymbol, emaSeries, volumeSeries);
}
window.onload = (event) => {
  graphSeries('BTCUSDT');
  const symbolSelector = document.getElementById('symbolSelector');

  fetchTickers().then((tickers) => {
    tickers.forEach((ticker) => {
      const option = document.createElement('option');
      option.value = ticker.symbol;
      option.textContent = ticker.symbol;
      symbolSelector.appendChild(option);
    });
  });

  symbolSelector.addEventListener('change', async (event) => {
    const selectedSymbol = event.target.value;

    // Llama a la función graphSeries con el símbolo seleccionado
    graph(series, selectedSymbol, emaSeries, volumeSeries);
    // También puedes actualizar el texto del encabezado "Historical Chart"
    set_symbol(selectedSymbol);
  });

  analyzeCoins();
  setInterval(loopFunction, 60000);  

};
