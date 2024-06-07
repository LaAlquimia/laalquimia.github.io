<script lang="js">
    import { onMount } from "svelte";
    import { ethers } from "ethers";
    import { writable } from "svelte/store";
    import { userInfo } from "../../store.js";
    import { checkTokenBalance } from "../../scripts/login.js";
    import { login } from "../login.js";
    import { stakingABI, TokenABI } from "./StakingABI";
    import { isLoginPersistent } from "../../store";
    import ChartSv from "../chart/ChartSv.svelte";
    import Balance from "../balance/Balance.svelte";

    let approved = writable(0);
    let stakingAmount = writable("");
    const user = localStorage.getItem("accountAddress") || null;

    const TOKEN_ADDRESS = "0x4b48c0db4e460c894bfc031d602a5c3b57a26857";
    const STAKING_ADDRESS = "0xf054176e4ebc9da226b52fc895a1a4a7d9148aeb";

    let provider;
    let signer;
    let tokenContract;
    let stakingContract;

    onMount(async () => {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
            provider = ethers.getDefaultProvider();
            alert("Metamask Not Installed");
        } else {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            tokenContract = new ethers.Contract(
                TOKEN_ADDRESS,
                TokenABI,
                signer,
            );
            stakingContract = new ethers.Contract(
                STAKING_ADDRESS,
                stakingABI,
                signer,
            );
            
            checkApproval();
            updateBalance();
        }
    });

    async function checkApproval() {
        const address = await signer.getAddress();
        const allowance = await tokenContract.allowance(
            address,
            STAKING_ADDRESS,
        );
        console.log(allowance);
        approved.set(allowance);
    }

    async function updateBalance() {
        const balance = await checkTokenBalance(user);
        userInfo.setKey("address", user);
        userInfo.setKey("balance", parseFloat(balance).toFixed(2));

        const reward = await stakingContract.calculateReward(signer.address);
        const stakedAmount = await stakingContract.stakes(signer.address);
        userInfo.setKey("rewards", ethers.formatEther(`${reward}`));
        userInfo.setKey("staked", ethers.formatEther(`${stakedAmount[0]}`));
        console.log(`${reward}`);
    }

    async function approve() {
        const amount = ethers.MaxUint256;
        const tx = await tokenContract.approve(STAKING_ADDRESS, amount);
        await tx.wait();
        checkApproval();
    }

    async function stake() {
        const amount = ethers.parseUnits($stakingAmount, 18);
        const tx = await stakingContract.stake(amount);
        await tx.wait();
        updateBalance();
    }

    async function handleLogin() {
        if (!$isLoginPersistent) {
            // login();
        }
    }
</script>

<div class="staking-container text-white bg-gray-900 ">
    {#if !$userInfo.address}
        <button on:click={handleLogin} class="button">Login</button>
    {/if}

    {#if $userInfo.address}
        <p>ALQ Address: {$userInfo.address}</p>
        <p>ALQ Balance: {$userInfo.balance}</p>
        <p>ALQ Staked : {$userInfo.staked}</p>
        <p>ALQ Reward : {$userInfo.rewards}</p>

        {#if !$approved}
            <button on:click={approve} class="button">Approve ALQ</button>
        {/if}

        {#if $approved}
            <input
                class="input"
                type="string"
                bind:value={$stakingAmount}
                placeholder="Amount to stake"
            />
            <button on:click={stake} class="button">Stake ALQ</button>
        {/if}
    {/if}
</div>

<style>
    .staking-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .input {
        margin: 10px 0;
    }

    .button {
        margin: 10px;
    }
</style>
