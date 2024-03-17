// fetchData.js
export const fetchData = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m');
      const data = await response.json();
      
      return data; // Devolver los datos obtenidos
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  };

