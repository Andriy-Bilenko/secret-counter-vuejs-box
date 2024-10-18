<template>
    <div class="grid items-center grid-cols-2">
      <div class="flex pb-2 self-center">
        <img src="../assets/title_star.svg" alt="Simple secret counter app">
        <h2 class="ml-2 text-2xl font-medium tracking-widest text-[#200E32] dark:text-white">{{title}}</h2>
        <div>
          <button
            :class="buttonClass"
            @click="connectWallet"
          >
            {{ buttonText }}
          </button>
        </div>
      </div>
  
      <img @click="showApp = false" class="justify-self-end cursor-pointer" v-if="showApp && isLight()" src="../assets/up.svg" alt="Hide application">
      <img @click="showApp = true" class="justify-self-end cursor-pointer" v-if="!showApp && isLight()" src="../assets/down.svg" alt="Show application">
  
      <img @click="showApp = false" class="justify-self-end cursor-pointer" v-if="showApp && isDark()" src="../assets/up_white.svg" alt="Hide application">
      <img @click="showApp = true" class="justify-self-end cursor-pointer" v-if="!showApp && isDark()" src="../assets/down_white.svg" alt="Show application">
    </div>
  
    <div v-if="showApp">
      <div class="grid grid-cols-3 w-full justify-items-center mt-12 mb-16">
        <div class="col-start-2 h-full font-bold text-[160px] leading-none">{{count}}</div>
        <button @click="incrementCounter" class="cols-start-3 w-max bg-box-yellow h-max self-center px-9 py-4 font-semibold rounded-md text-2xl ml-4"> + </button>
      </div>
  
      <div class="grid w-full justify-items-center mb-16">
        <button @click="resetCounter" class="font-semibold text-[#4E4B66] dark:text-white border-2 border-[#4E4B66] dark:border-white px-8 py-3 rounded-md">Reset Counter?</button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { Wallet, SecretNetworkClient, TxResponse } from "secretjs";
  import { Window as KeplrWindow } from "@keplr-wallet/types";
  
  declare global {
    interface Window extends KeplrWindow {}
  }
  
  // Get environment variables from .env
  const secretBoxCode: string = import.meta.env.VITE_SECRET_BOX_CODE!;
  const secretBoxHash: string = import.meta.env.VITE_SECRET_BOX_HASH!;
  const secretBoxAddress: string = import.meta.env.VITE_SECRET_BOX_ADDRESS!;
  const localSecretUrl: string = import.meta.env.VITE_LOCALSECRET_LCD!; // meant to be RPC but can be LCD too
  const chainId: string = import.meta.env.VITE_CHAIN_ID!;
  
  console.log(`local url = ${localSecretUrl}`);
  console.log(`code id = ${secretBoxCode}`);
  console.log(`contract hash = ${secretBoxHash}`);
  console.log(`contract address = ${secretBoxAddress}`);
  
  // Secret.js Client
  let secretjs: SecretNetworkClient | undefined;
  
  // let keplrOfflineSigner: OfflineAminoSigner;
  let myWalletAddr: string | undefined;
  
  async function requestKeplr(): Promise<string>{
    if (!window.keplr) {
      alert("Please install keplr extension");
      return "";
    }
  
    // Enabling before using the Keplr is recommended.
    // This method will ask the user whether to allow access if they haven't visited this website.
    // Also, it will request that the user unlock the wallet if the wallet is locked.
    await window.keplr.enable(chainId);
  
    const offlineSigner = window.keplr.getOfflineSigner(chainId);
  
    // You can get the address/public keys by `getAccounts` method.
    // It can return the array of address/public key.
    // But, currently, Keplr extension manages only one address/public key pair.
    // XXX: This line is needed to set the sender address for SigningCosmosClient.
    const accounts = await offlineSigner.getAccounts();
  
    console.log("accounts: ", accounts);
    console.log("offlineSigner: ", offlineSigner);
  
    const keplrOfflineSigner = window.keplr.getOfflineSignerOnlyAmino(chainId);
    [{ address: myWalletAddr }] = await keplrOfflineSigner.getAccounts();
  
    console.log("Initializing Secret.js client ...");
    secretjs = new SecretNetworkClient({
      url: localSecretUrl,
      chainId: chainId,
      wallet: keplrOfflineSigner,
      walletAddress: myWalletAddr,
      encryptionUtils: window.keplr.getEnigmaUtils(chainId),
    });
  
    console.log(`Created client for wallet address: ${myWalletAddr}`);
    return myWalletAddr;
  }
  
  const count = ref(0);
  const showApp = ref(true);
  const isWalletConnected = ref(false);

  const buttonText = ref('Connect Wallet');
  const buttonClass = ref('ml-2 text-2xl font-medium tracking-widest text-[#200E32] dark:text-white');
  
  onMounted(async () => {
    window.addEventListener('scroll', handleScroll);
    checkWalletConnection();
    count.value = await queryCounter();
  });
  
  const queryCounter = async () => {
    const readOnlySecretjs = new SecretNetworkClient({
      url: localSecretUrl, // Replace with the appropriate API URL
      chainId: chainId, // Replace with the appropriate chain ID
    });
  
    type CountResponse = { count: number };
  
    const response = (await readOnlySecretjs.query.compute.queryContract({
      contract_address: secretBoxAddress,
      code_hash: secretBoxHash,
      query: { get_count: {} },
    })) as CountResponse;
  
    if ('err"' in response) {
      throw new Error(
        `Query failed with the following err: ${JSON.stringify(response)}`
      );
    }
    console.log("queried smart contract: ", response);
    return response.count;
  };
  
  const incrementCounter = async () => {
    if (secretjs === undefined){
      alert("Jesus Christ connect the wallet!");
      return;
    }
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: myWalletAddr!,
        contract_address: secretBoxAddress,
        code_hash: secretBoxHash,
        msg: {
          increment: {},
        },
      },
      {
        gasLimit: 1_000_000,
      }
    );
  
    console.log("Increment by 1");
    count.value = await queryCounter();
  };
  
  const resetCounter = async () => {
    if (secretjs === undefined){
      alert("Jesus Christ connect the wallet!");
      return;
    }
    const tx = await secretjs.tx.compute.executeContract(
      {
        sender: myWalletAddr!,
        contract_address: secretBoxAddress,
        code_hash: secretBoxHash,
        msg: {
          reset: { count: 0 },
        },
      },
      {
        gasLimit: 1_000_000,
      }
    );

    console.log("tx:", tx.rawLog)

    // Check for specific contract errors
    if (tx.rawLog.includes("Unauthorized")) {
        alert("You are not authorized to reset the counter.");

    return;
    } else if(tx.rawLog.includes("failed")){
        alert("Unknown failure to reset counter. Please try again.");

    return;
    }
    
  
    console.log("Counter reset");
    count.value = await queryCounter();
  };
  
  const props = defineProps<{
    title: string;
  }>();
  
  function isLight() {
    return localStorage.getItem('theme') === 'light';
  }
  
  function isDark() {
    return localStorage.getItem('theme') === 'dark';
  }
  
  function handleScroll() {
    if (showApp) {
      // To collapse App when user scrolls:
      // showApp.value = false
    }
  }

  const checkWalletConnection = () => {
  if (myWalletAddr && secretjs) {
    isWalletConnected.value = true;
    buttonText.value = 'Disconnect Wallet\n(Connected to ' + myWalletAddr + ')';
    buttonClass.value = 'ml-2 text-2xl font-medium tracking-widest text-[#FF0000] dark:text-white'; // Change to red color
  } else {
    isWalletConnected.value = false;
    buttonText.value = 'Connect Wallet';
    buttonClass.value = 'ml-2 text-2xl font-medium tracking-widest text-[#200E32] dark:text-white'; // Change back to original color
  }
};


  const disconnectWallet = () => {
    isWalletConnected.value = false;
    myWalletAddr = undefined;
    secretjs = undefined;
  buttonText.value = 'Connect Wallet';
  buttonClass.value = 'ml-2 text-2xl font-medium tracking-widest text-[#200E32] dark:text-white'; // Change back to original color
  // Add any additional logic to disconnect the wallet if needed
  window.keplr!.disable(chainId);
};

  
  const connectWallet = async () => {
    if (isWalletConnected.value) {
    disconnectWallet();
  } else {
    let currentWalletAddr = await requestKeplr();
    isWalletConnected.value = true;
    buttonText.value = 'Disconnect Wallet\n(Connected to ' + currentWalletAddr + ')';
    buttonClass.value = 'ml-2 text-2xl font-medium tracking-widest text-[#FF0000] dark:text-white'; // Change to red color
  }
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  