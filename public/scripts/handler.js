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
    row.onclick = () => graph(series, symbol, emaSeries, volumeSeries);
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