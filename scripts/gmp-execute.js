'use strict';

require('dotenv').config();

const { ethers } = require('hardhat');
const {
    getContractAt,
    Wallet,
    utils,
    providers: { JsonRpcProvider },
} = ethers;

const { printLog, printObj, confirm, parseWei, getTxOptions } = require('./utils');

const { getRandomID } = require('../test/utils');

// these environment variables should be defined in an '.env' file
const skipConfirm = process.env.SKIP_CONFIRM;
const sourceChain = 'ethereum-2';
const sourceAddress = '0x0D4C7DDBff6a26619F865Ed53CE620f715e7F31b';
const payloadTypes = ['string'];
const payloadValues = [''];
const commandIDhex = '0xa30abf8811c826a24a072b065a660a9b042611cb938db61993d21f75be26d4fb';
const contractAddress = '0x6c15f7b26C2b14C0B3f7dC3CCF3d283EF2dA0C2E';
// const url = 'https://api.avax-test.network/ext/bc/C/rpc';
const url = 'https://eth-goerli.g.alchemy.com/v2/u1WmstiSjUmEYFMr_x8bxqMpwsZYCbJW';
const privKey = '0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144';
const gasPrice = parseWei(process.env.GAS_PRICE);
const maxFeePerGas = parseWei(process.env.MAX_FEE_PER_GAS);
const maxPriorityFeePerGas = parseWei(process.env.MAX_PRIORITY_FEE_PER_GAS);
const gasLimit = process.env.GAS_LIMIT ? Number(process.env.GAS_LIMIT) : Number(25000);

confirm(
    {
        URL: url || null,
        PRIVATE_KEY: '*****REDACTED*****' || null,
        SOURCE_CHAIN: sourceChain || null,
        SOURCE_ADDRESS: sourceAddress || null,
        PAYLOAD_TYPES: payloadTypes || null,
        PAYLOAD_VALUES: payloadValues || null,
        COMMAND_ID: commandIDhex || null,
        CONTRACT_ADDRESS: contractAddress || null,
        MAX_FEE_PER_GAS: maxFeePerGas?.toString() || null,
        MAX_PRIORITY_FEE_PER_GAS: maxPriorityFeePerGas?.toString() || null,
        GAS_PRICE: gasPrice?.toString() || null,
        GAS_LIMIT: gasLimit || null,
        SKIP_CONFIRM: skipConfirm || null,
    },
    url && privKey && sourceChain && sourceAddress && payloadTypes && payloadValues && commandIDhex && contractAddress,
);
const provider = new JsonRpcProvider(url);
const wallet = new Wallet(privKey, provider);

const payloadBytes = utils.arrayify(utils.defaultAbiCoder.encode(['address'], ['0x0D4C7DDBff6a26619F865Ed53CE620f715e7F31b']));
const commandID = utils.arrayify(commandIDhex.startsWith('0x') ? commandIDhex : '0x' + commandIDhex);
const transactions = {};

(async () => {
    printLog('fetching fee data');
    const feeData = await provider.getFeeData();

    const options = getTxOptions(feeData, { maxFeePerGas, maxPriorityFeePerGas, gasPrice, gasLimit });
    printObj({ tx_options: options });

    printLog(
        `executing call for source chain ${sourceChain}, source address ${sourceAddress}, command ID ${commandIDhex}, and payload hash ${payloadTypes}`,
    );
    const tx = await (
        await getContractAt('AxelarExecutable', contractAddress, wallet)
    ).execute(commandID, sourceChain, sourceAddress, payloadBytes, options);
    await tx.wait();
    printLog(`successfully executed call at tx ${tx.hash}`);

    transactions.validated = tx.hash;
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        printObj({ transactions_sent: transactions });
    });
