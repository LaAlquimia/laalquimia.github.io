
var chart = null;
var series = null;
var emaSeries = null;
var volumeSeries = null;
var longSymbols = [];
var shortSymbols = [];
var tickers = null;
var signal_count = null;

const set_symbol = (symbol) => {
  document.getElementById('symbol').textContent = symbol;
}

const signals = (kline, symbol, emaDist) => {
  const ordered = convertirDatos(kline).reverse();   
  const rsi = RSI(ordered.map(entry => entry.open), 14);
  if (rsi[0] < rsi[1] && rsi[1] > 75 && emaDist > 3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt*100).toFixed(2);
    const signalMessage = 'SHORT ⛔'+ symbol + '\nEMA distance: ' + emaDist.toFixed(2) + '%\n 24h PriceChange ' + (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt*100).toFixed(2) +'%';
    const speech = 'Short'+ symbol + 'Distancia a la media' + emaDist.toFixed(2) + '%';
    speak(speech); 
    notifyMe(symbol, signalMessage);
  } else if (rsi[0] > rsi[1] && rsi[1] < 25 && emaDist < -3) {
    const percent = (tickers.find(ticker => ticker.symbol === symbol).price24hPcnt*100).toFixed(2);
    const signalMessage = 'LONG 🟢'+ symbol + '\nEMA distance ' + emaDist.toFixed(2) + '%\n24h PriceChange ' + percent;
    const speech = 'long'+ symbol + 'Distancia a la media' + emaDist.toFixed(2) + '%';
    speak(speech);   
    notifyMe(symbol, signalMessage);
  }
}
// request permission on page load
document.addEventListener('DOMContentLoaded', function() {
  if (!Notification) {
   alert('Desktop notifications not available in your browser.');
   return;
  }
 
  if (Notification.permission !== 'granted')
   Notification.requestPermission();
 });
 

const loopFunct = () => {
  analyzeCoins();
  const currentsymbol = document.getElementById('symbol').textContent;
  graph(series, currentsymbol, emaSeries, volumeSeries);
}
window.onload = (event) => {
  graphSeries('BTCUSDT');
  analyzeCoins();
  setInterval(loopFunct, 60000);  
  
};
