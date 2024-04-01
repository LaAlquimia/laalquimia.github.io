<script>
    import { userInfo } from "../../store.js";
    import { checkTokenBalance } from "../../scripts/login.js";
    import { login } from "../login.js";
    const user = localStorage.getItem('accountAddress') || null
    if (user) {
        const balance = checkTokenBalance(user).then((balance) => {
            userInfo.setKey('address', user)
            userInfo.setKey('balance', parseFloat(balance).toFixed(2))
        })
    }
</script>

{#if $userInfo.balance}
<nav class="select-none px-2 bg-gray-900 rounded-xl flex items-center space-x-2 mx-2 hover:scale-105">
    <img src="/favicon.ico" alt="tortuga" class="w-6 h-6" />     
    <p class="my-auto " >
        {$userInfo.balance} 
    </p>
    <p class="my-auto " >
        {$userInfo.address.slice(0, 3) + '...' + $userInfo.address.slice(-4)} 
    </p>
</nav>
{/if}
{#if !$userInfo.address}
<button id="login" on:click={login}>Login</button>


{/if}
