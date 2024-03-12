import { ethers } from "ethers";
import { isLogin } from "../store.js";

const btn = document.getElementById('login');
let signer = null;
let provider;
let address;

// Función asíncrona para el inicio de sesión
async function login() {
  if (window.ethereum == null) {
    console.log("MetaMask not installed; using read-only defaults");
    provider = ethers.getDefaultProvider();
    alert('Metamask Not Installed')
  } else {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    address = await signer.getAddress();
    isLogin.set(true);
    localStorage.setItem('accountAddress', address);
  }

  btn.innerText = address.slice(0, 3) + "..." + address.slice(-4);
}

// Agregar el controlador de eventos al botón
btn.addEventListener('click', login);

// Verificar si existe una dirección almacenada en el localStorage al cargar la página
const storedAddress = localStorage.getItem('accountAddress');
if (storedAddress) {
  btn.innerText = storedAddress.slice(0, 3) + "..." + storedAddress.slice(-4);
}