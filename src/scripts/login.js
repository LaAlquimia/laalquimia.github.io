// En login.js

import { ethers } from 'ethers';

// Definir la función checkTokenBalance
async function checkTokenBalance(tokenAddress, holderAddress) {
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Crear una instancia del contrato del token
      const tokenContract = new ethers.Contract(tokenAddress, abi, signer);
      
      // Llamar al método balanceOf para obtener el saldo del token
      const bal= await tokenContract.balanceOf(holderAddress);
      const balance = ethers.formatUnits(bal, 18);
      console.log(balance);
    // 18 decimales para Ethereum
      return balance;
      // Manejar el saldo aquí, por ejemplo, mostrarlo en la interfaz de usuario
    } catch (error) {
      console.error('Error:', error);
      // Manejar errores
    }
}

// Exportar la función checkTokenBalance para que esté disponible en otros archivos
export { checkTokenBalance };
