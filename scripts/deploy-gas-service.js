'use strict';

require('dotenv').config();

const { printLog, printObj, confirm, parseWei, getTxOptions } = require('./utils');
const { ethers } = require('hardhat');
const {
    getContractFactory,
    Wallet,
    providers: { JsonRpcProvider },
    utils: { defaultAbiCoder, arrayify },
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
    printLog('fetching fee data');
    const feeData = await provider.getFeeData();
    printObj({ feeData });
    const options = getTxOptions(feeData, { maxFeePerGas, maxPriorityFeePerGas, gasPrice, gasLimit });
    printObj({ tx_options: options });

    printLog('loading contract factories');
    // the ABIs for the contracts below must be manually downloaded/compiled
    const gasServiceFactory = await getContractFactory('AxelarGasService', wallet);
    const gasReceiverProxyFactory = await getContractFactory('AxelarGasReceiverProxy', wallet);
    const authFactory = await getContractFactory('AxelarAuthWeighted', wallet);
    printLog('contract factories loaded');

    printLog(`deploying auth contract`);
    const auth = await authFactory.deploy(paramsAuth).then((d) => d.deployed());
    printLog(`params of auth contract ${paramsAuth}`);
    printLog(`deployed auth at address ${auth.address}`);
    contracts.auth = auth.address;

    printLog(`deploying gas service contract`);
    const gasService = await gasServiceFactory.deploy(auth.address).then((d) => d.deployed());
    printLog(`deployed gas service at address ${gasService.address}`);
    printLog(`param of gas service contract ${auth.address}`);
    contracts.gasService = gasService.address;

    printLog(`deploying gas receiver proxy contract`);
    const gasReceiverProxy = await gasReceiverProxyFactory.deploy(gasService.address, paramsProxy).then((d) => d.deployed());
    printLog(`deployed gas receiver proxy at address ${gasReceiverProxy.address}`);
    printLog(`param of gas receiver proxy contract ${gasService.address} ${paramsProxy}`);
    contracts.gasReceiverProxy = gasReceiverProxy.address;

    printLog('transferring auth ownership');
    await auth.transferOwnership(gasReceiverProxy.address, options);
    printLog('transferred auth ownership. All done!');
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        printObj({ contract_addresses: contracts });
    });
