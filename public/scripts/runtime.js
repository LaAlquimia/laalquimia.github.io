/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
var signaltime = null;
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
const runFunction = () => {
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

if (chart == null){
    setTimeout(runFunction, 1000)
    if (!Notification) {
      alert('Desktop notifications not available in your browser.');
    }
  
    if (Notification.permission !== 'granted')
      Notification.requestPermission();
}