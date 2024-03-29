import { ethers } from 'ethers'
import { isLogin } from '../store.js'
import { isLoginPersistent } from '../store.js'
import { checkTokenBalance } from '../scripts/login.js'
const btn = document.getElementById('login')
let signer = null
let provider
let address
const tokenAddress = '0x4b48c0db4e460c894bfc031d602a5c3b57a26857'
// abi for balance of token


// Función asíncrona para el inicio de sesión
async function login () {
  if (window.ethereum == null) {
    console.log('MetaMask not installed; using read-only defaults')
    provider = ethers.getDefaultProvider()
    alert('Metamask Not Installed')
  } else {
    provider = new ethers.BrowserProvider(window.ethereum)
    signer = await provider.getSigner()
    address = await signer.getAddress()
    isLogin.set(true)
    isLoginPersistent.set(true)
    localStorage.setItem('accountAddress', address)
  }
  const blc = await checkTokenBalance(tokenAddress, address)
  btn.innerText = address.slice(0, 3) + '...' + address.slice(-4)+' '+parseFloat(blc).toFixed(2)
  // append a button to parent btn container
  const btnParent = btn.parentElement
  const logoutBtn = document.createElement('button')
  logoutBtn.innerText = 'Logout'
  logoutBtn.addEventListener('click', logOut)
  btnParent.appendChild(logoutBtn)
}

async function logOut () {
  isLogin.set(false)
  isLoginPersistent.set(false)
  localStorage.removeItem('accountAddress')
  btn.innerText = 'Login'
}

// Agregar el controlador de eventos al botón
btn.addEventListener('click', login)

// Verificar si existe una dirección almacenada en el localStorage al cargar la página
const storedAddress = localStorage.getItem('accountAddress')
if (storedAddress) {
  const balance = await checkTokenBalance(tokenAddress, storedAddress)  

  btn.innerText = storedAddress.slice(0, 3) + '...' + storedAddress.slice(-4)+' '+parseFloat(balance).toFixed(2)
}


