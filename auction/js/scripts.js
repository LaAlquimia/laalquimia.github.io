/*!
* Start Bootstrap - Shop Item v5.0.6 (https://startbootstrap.com/template/shop-item)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-shop-item/blob/master/LICENSE)
*/
// This file is intentionally blank
// Use this file to add JavaScript to your project

const loginWithEth = async () => {
    // check if there is global window.web3 instance
    if (window.web3) {
      try {
        // get the user's ethereum account - prompts metamask to login
        const selectedAccount = await window.ethereum
          .request({
            method: "eth_requestAccounts",
          })
          .then((accounts) => accounts[0])
          .catch(() => {
            // if the user cancels the login prompt
            throw Error("Please select an account");
          });
  
        // set the global userWalletAddress variable to selected account
        window.userWalletAddress = selectedAccount;
  
        // store the user's wallet address in local storage
        window.localStorage.setItem("userWalletAddress", selectedAccount);
  
        const walletid = document.getElementById("walletid")
        const tokenbalance = document.getElementById("tokenbalance") 
  
  
        const conn = new Web3(window.ethereum);
        
  
        const tokenContract = new conn.eth.Contract(fullABI, contractAddress);      
        const address = ethereum.selectedAddress;
        console.log(address)
  
        async function obtenerBalance() {
          const balance = await tokenContract.methods.balanceOf(address).call()/10**18;
          console.log(balance)
          return balance
        } 
  
        async function ogtBalance() {
          const balance = await ogtContract.methods.balanceOf(address).call()/10**18;
          console.log(balance);
          return balance
        } 
  
        walletid.innerHTML = address.slice(0, 3)+ "..."+address.slice(- 4);
        bal =  await obtenerBalance();
        tokenbalance.textContent = bal;
  
      } catch (error) {
        alert(error);
      }
    } else {
      alert("wallet not found");
    }
  };