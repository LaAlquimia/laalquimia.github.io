// En login.js

import { ethers } from 'ethers';
const bscRpcUrls = [
  "https://bsc-dataseed.binance.org",
  "https://binance.llamarpc.com",
  "https://rpc.ankr.com/bsc"
];

async function getBscProvider() {
  for (let rpc of bscRpcUrls) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      await provider.getBlockNumber();
      return provider;
    } catch (e) {
      console.warn(`BSC RPC failed: ${rpc}`, e.message);
    }
  }
  throw new Error("No BSC RPC available");
}

// Definir la función checkTokenBalance
async function checkTokenBalance(holderAddress) {
    const abi = [
        // Método para obtener el saldo del token para una dirección específica
        {
          "constant":true,
          "inputs":[{"name":"_owner","type":"address"}],
          "name":"balanceOf",
          "outputs":[{"name":"balance","type":"uint256"}],
          "type":"function"
        }
      ];
    try {
      const provider = await getBscProvider();
      
      // Crear una instancia del contrato del token
      const tokenAddress = '0x4b48c0db4e460c894bfc031d602a5c3b57a26857';  
      const tokenContract = new ethers.Contract(tokenAddress, abi, provider);
      
      // Llamar al método balanceOf para obtener el saldo del token
      const bal = await tokenContract.balanceOf(holderAddress);
      const balance = ethers.formatUnits(bal, 18);
      console.log("ALQ balance on BSC:", balance);
      return balance;
    } catch (error) {
      console.error('Error fetching BSC token balance:', error);
    }
}

// Exportar la función checkTokenBalance para que esté disponible en otros archivos
export { checkTokenBalance };
