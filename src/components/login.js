
import { ethers } from "ethers";
import { isLogin } from "../store.js"; 
const btn = document.getElementById('login');
let signer = null;

let provider;
let address;
if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults")
    provider = ethers.getDefaultProvider()

} else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner();
    address= ethereum.selectedAddress
    isLogin.set(true)
}
btn.innerText = address.slice(0, 3)+ "..."+address.slice(- 4);