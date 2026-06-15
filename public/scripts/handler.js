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
  const table = document.getElementById(tableId);
  if (!table) return;
  const tableBody = table.getElementsByTagName('tbody')[0];
  if (!tableBody) return;

  // Adjust number of rows
  while (tableBody.rows.length < data.length) {
    const row = document.createElement('tr');
    row.classList.add('cellrow');
    row.style.cursor = 'pointer';
    
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    const cell3 = document.createElement('td');
    
    row.appendChild(cell1);
    row.appendChild(cell2);
    row.appendChild(cell3);
    tableBody.appendChild(row);
  }

  while (tableBody.rows.length > data.length) {
    tableBody.deleteRow(tableBody.rows.length - 1);
  }

  // Update cell values in place
  data.forEach(({ symbol, EMA_dist, price24hPcnt }, index) => {
    const row = tableBody.rows[index];
    const cell1 = row.cells[0];
    const cell2 = row.cells[1];
    const cell3 = row.cells[2];

    cell1.textContent = symbol;
    cell2.textContent = `${EMA_dist.toFixed(2)}%`;
    cell3.textContent = `${price24hPcnt}%`;

    if (price24hPcnt > 0) {
      cell3.className = 'positive';
    } else {
      cell3.className = 'negative';
    }

    row.onclick = () => {
      graph(series, symbol, emaSeries, volumeSeries);
      const symbolSelector = document.getElementById('symbolSelector');
      if (symbolSelector) {
        symbolSelector.value = symbol;
      }
    };
  });
};
document.getElementById('intervalSelector').addEventListener('change', function() {
  var selectedInterval = this.value;
  var selectedIntervalText = this.options[this.selectedIndex].text;

  // Suponiendo que la variable 'interval' ya existe en el alcance global
  interval = selectedInterval;
  graph(series, gSymbol, emaSeries, volumeSeries)
});




