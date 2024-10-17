import { SecretNetworkClient, Wallet } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../contract.wasm.gz");

// setting secret js client
const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
});

// see what is it
// console.log(secretjs);

let codeId = 10685;
let contractCodeHash =
  "76e2f326cb4f2c4dd18789788c5fae911baf4d6da6162b2daaa5f08410a8671d";
let contractAddress = "secret14fvklfvj0d3fe52wd338n0869ygf7eqvdrj7ps";

// upload the compiled contract
let upload_contract = async () => {
  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );

  console.log("codeId: ", codeId);

  contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;
  console.log(`Contract hash: ${contractCodeHash}`);
};

// upload_contract();

// instantiate the contract
let instantiate_contract = async () => {
  // Create an instance of the Counter contract, providing a starting count
  const initMsg = { count: 0 };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: initMsg,
      label: "My Counter" + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log(contractAddress);
};

// instantiate_contract();

// query message
let try_query_count = async () => {
  const my_query = await secretjs.query.compute.queryContract({
    contract_address: contractAddress,
    code_hash: contractCodeHash,
    query: { get_count: {} },
  });

  console.log(my_query);
};

await try_query_count();

// execute message
let try_increment_count = async () => {
  let tx = await secretjs.tx.compute.executeContract(
    {
      sender: wallet.address,
      contract_address: contractAddress,
      code_hash: contractCodeHash, // optional but way faster
      msg: {
        increment: {},
      },
      sentFunds: [], // optional
    },
    {
      gasLimit: 100_000,
    }
  );
  console.log("incrementing...");
};

await try_increment_count();
await try_query_count();
