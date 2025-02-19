import { ethers } from "ethers";

const contractAddress = "0xd78be833ed889929b50d2ad3ab7ba94f76a9a8bf";
const tokenIds = [1,2,3];
const botUrl = [ `meanRev`,`BinanceMeanRev`,`TraderBot`] ;
const botNames = [ `Bybit Mean Rev`,`Binance Mean Rev`,`Trader`] ;
const botImages = [ `botMeanRev1.png`, `BinanceMRBot.png`, `TraderBot.png`] ;
const openseaLink = `https://opensea.io/assets/base/${contractAddress}`;
const rpcUrl = `https://0xrpc.io/base`
const abi = [
  "function balanceOfBatch(address[], uint256[]) view returns (uint256[])"
];

export async function checkBalances() {
  if (!window.ethereum) {
    console.error("MetaMask no detectado");
    return {};
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const userAddress = localStorage.getItem("accountAddress");
    console.log(userAddress)
    
    const contract = new ethers.Contract(contractAddress, abi, provider);

    const owners = tokenIds.map(() => userAddress); // Lista de la misma dirección
    const balances = await contract.balanceOfBatch(owners, tokenIds);

    let balanceMap = {};
    tokenIds.forEach((id, index) => {
      balanceMap[id] = balances[index].toString();
    });

    return balanceMap;
  } catch (error) {
    console.error("Error obteniendo balances:", error);
    return {};
  }
}

export { tokenIds, openseaLink, botUrl, botNames, botImages };
