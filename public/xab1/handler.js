/* eslint-disable no-undef */


// create functions to save signals to a json string in local storage
// Functions must be save signal, load signal, and delete signal

const saveSignal = (symbool , time, singalType, price , emaDist) => {

  const signal = {
    symbol: symbool,
    time: time,
    singalType: singalType,
    price: price,
    emaDist: emaDist
  }

  const signals = JSON.parse(localStorage.getItem('signals')) || []
  // not same time 
  const existingSignal = signals.find(s => s.time === time)
  if (existingSignal) {
    return
  }

  signals.push(signal)
  localStorage.setItem('signals', JSON.stringify(signals))
}
// funtion to load all signals 
const loadSignals = () => {
  const signals = JSON.parse(localStorage.getItem('signals'))
  if (signals) {
    return signals
  }
  return []
}

// function to load signals from local storage by symbol

const loadSignalsBySymbol = (symbol) => {
  const signals = JSON.parse(localStorage.getItem('signals'))
  if (signals) {
    return signals.filter(signal => signal.symbol === symbol)
  }
  return []
}

// function to clear signals from local storage by symbol

const clearSignals = (symbol) => {
  const signals = JSON.parse(localStorage.getItem('signals'))
  if (signals) {
    const filteredSignals = signals.filter(signal => signal.symbol !== symbol)
    localStorage.setItem('signals', JSON.stringify(filteredSignals))
  }
}










const populateTable = (tableId, data) => {
  const tableBody = document.getElementById(tableId).getElementsByTagName('tbody')[0];
  tableBody.innerHTML = '';

  data.forEach(({ symbol, EMA_dist, price24hPcnt }) => {
    const row = tableBody.insertRow();
    row.classList.add('cellrow');
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    const cell3 = row.insertCell(2);
    cell1.textContent = symbol;
    row.onclick = () => {
      graph(series, symbol, emaSeries, volumeSeries)
      document.getElementById('symbolSelector').value = symbol
    };
    cell2.textContent = `${EMA_dist.toFixed(2)}%`;
    cell3.textContent = `${price24hPcnt}%`;
    row.style.cursor = 'pointer';
    if (0 < price24hPcnt) {
      cell3.className = 'positive';
    } else {
      cell3.className = 'negative';
    }
  });
};
document.getElementById('intervalSelector').addEventListener('change', function() {
  var selectedInterval = this.value;
  var selectedIntervalText = this.options[this.selectedIndex].text;

  // Suponiendo que la variable 'interval' ya existe en el alcance global
  interval = selectedInterval;
  graph(series, gSymbol, emaSeries, volumeSeries)
});




