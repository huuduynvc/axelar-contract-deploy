'use strict';

require('dotenv').config();

const { printLog, printObj, confirm, parseWei } = require('./utils');
const { ethers } = require('hardhat');
const {
    getContractFactory,
    Wallet,
    providers: { JsonRpcProvider },
} = ethers;

// these environment variables should be defined in an '.env' file
const skipConfirm = process.env.SKIP_CONFIRM;
const prefix = 'axelar';
// const chain = 'fuji';
// const url = 'https://api.avax-test.network/ext/bc/C/rpc';
const chain = 'goerli';
const url = 'https://eth-goerli.g.alchemy.com/v2/u1WmstiSjUmEYFMr_x8bxqMpwsZYCbJW';
const privKey = '0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144';
const adminPubkeys = process.env.ADMIN_PUBKEYS;
const adminAddresses = '0x82029f30d6e6cdb0ddb3c0582cd7822104926979';
const adminThreshold = 1;
const gasPrice = parseWei(process.env.GAS_PRICE);
const maxFeePerGas = parseWei(process.env.MAX_FEE_PER_GAS);
const maxPriorityFeePerGas = parseWei(process.env.MAX_PRIORITY_FEE_PER_GAS);
const gasLimit = process.env.GAS_LIMIT ? Number(process.env.GAS_LIMIT) : Number(22000);

// main execution
confirm(
    {
        PREFIX: prefix || null,
        CHAIN: chain || null,
        URL: url || null,
        PRIVATE_KEY: privKey ? '*****REDACTED*****' : null,
        ADMIN_PUBKEYS: adminPubkeys || null,
        ADMIN_ADDRESSES: adminAddresses || null,
        ADMIN_THRESHOLD: adminThreshold || null,
        MAX_FEE_PER_GAS: maxFeePerGas?.toString() || null,
        MAX_PRIORITY_FEE_PER_GAS: maxPriorityFeePerGas?.toString() || null,
        GAS_PRICE: gasPrice?.toString() || null,
        GAS_LIMIT: gasLimit || 22000,
        SKIP_CONFIRM: skipConfirm || null,
    },
    prefix && chain && url && privKey && adminThreshold && (adminPubkeys || adminAddresses),
);

const provider = new JsonRpcProvider(url);
const wallet = new Wallet(privKey, provider);

const contracts = {};

(async () => {
    printLog('loading contract factories');
    const executableSampleFactory = await getContractFactory('ExecutableSample', wallet);
    printLog('executableSample contract factories loaded');

    printLog(`deploying executableSample contract`);
    const executableSample = await executableSampleFactory
        .deploy('0xc1c7BF746C4cc5eC0b3777f4C255BF26252e9531', '0xC47FD511FA38903942Ab1A395723f478Fe2F8E9C')
        .then((d) => d.deployed());
    printLog(`deployed executableSample at address ${executableSample.address}`);
    contracts.executableSample = executableSample.address;
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        printObj({ contract_addresses: contracts });
    });
