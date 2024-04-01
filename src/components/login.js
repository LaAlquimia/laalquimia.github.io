import { ethers } from 'ethers'
import { isLogin } from '../store.js'
import { isLoginPersistent } from '../store.js'
import { checkTokenBalance } from '../scripts/login.js'
import { userInfo } from '../store.js'
const btn = document.getElementById('login')
let signer = null
let provider
let address

// abi for balance of token


// Función asíncrona para el inicio de sesión
export async function login () {
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
    location.reload()

  }
  const blc = await checkTokenBalance(address)
  userInfo.setKey('balance', parseFloat(blc).toFixed(2) )
  btn.innerText = address.slice(0, 3) + '...' + address.slice(-4)
  // append a button to parent btn container

}

async function logOut () {
  isLogin.set(false)
  isLoginPersistent.set(false)
  localStorage.removeItem('accountAddress')
  btn.innerText = 'Login'
}


