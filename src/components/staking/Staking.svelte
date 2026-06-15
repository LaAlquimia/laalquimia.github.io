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

    async function unstake() {
        const tx = await stakingContract.unstake();
        await tx.wait();
        updateBalance();
    }

    async function handleLogin() {
        if (!$isLoginPersistent) {
            // login();
        }
    }
</script>

<div class="py-12 px-4 max-w-lg mx-auto">
    <div class="liquid-glass-card w-full p-8 text-center space-y-6">   
        <div>
            <h2 class="text-3xl font-extrabold tracking-tight">ALQ STAKING</h2>
            <h5 class="text-cyan-400 font-bold mt-1 text-lg">20% APR</h5>
        </div>

        {#if !$userInfo.address}
            <div class="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p class="text-red-400 m-0 font-medium">Please connect your wallet to stake ALQ</p>
            </div>
        {/if}

        {#if $userInfo.address}
            <div class="grid grid-cols-2 gap-4 text-left border-y border-white/5 py-6 my-4">
                <div class="space-y-1">
                    <span class="text-xs uppercase text-gray-500 tracking-wider font-semibold">ALQ Balance</span>
                    <p class="text-xl font-bold text-white">{$userInfo.balance || '0.00'}</p>
                </div>
                <div class="space-y-1">
                    <span class="text-xs uppercase text-gray-500 tracking-wider font-semibold">ALQ Staked</span>
                    <p class="text-xl font-bold text-white">{$userInfo.staked || '0.00'}</p>
                </div>
                <div class="col-span-2 space-y-1 pt-3 border-t border-white/5">
                    <span class="text-xs uppercase text-gray-500 tracking-wider font-semibold">Earned Rewards</span>
                    <p class="text-2xl font-extrabold text-emerald-400">{$userInfo.rewards || '0.00'}</p>
                </div>
            </div>

            {#if !$approved}
                <button on:click={approve} class="button w-full bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-bold transition-all">
                    Approve ALQ
                </button>
            {/if}

            {#if $approved}
                <div class="space-y-4">
                    <input
                        class="w-full text-center font-bold text-lg"
                        type="text"
                        bind:value={$stakingAmount}
                        placeholder="Amount to stake"
                    />
                    <div class="flex gap-4">
                        <button on:click={stake} 
                            class="button flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/30 text-cyan-400 py-3 rounded-xl font-bold transition-all">
                            Stake ALQ
                        </button>

                        {#if $userInfo.staked && parseFloat($userInfo.staked) > 0}
                            <button on:click={unstake} 
                                class="button flex-1 bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400 py-3 rounded-xl font-bold transition-all">
                                Unstake ALQ
                            </button>
                        {/if}
                    </div>
                </div>
            {/if}
        {/if}
    </div>
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
