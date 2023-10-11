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
const prefix = process.env.PREFIX;
const url = process.env.GOERLI_RPC_URL;
const privKey = process.env.PRIVATE_KEY;
const adminPubkeys = process.env.ADMIN_PUBKEYS;
const adminAddresses = process.env.ADMIN_ADDRESSES;
const adminThreshold = 1;
const gasPrice = parseWei(process.env.GAS_PRICE);
const maxFeePerGas = parseWei(process.env.MAX_FEE_PER_GAS);
const maxPriorityFeePerGas = parseWei(process.env.MAX_PRIORITY_FEE_PER_GAS);
const gasLimit = process.env.GAS_LIMIT ? Number(process.env.GAS_LIMIT) : Number(22000);

// main execution
confirm(
    {
        PREFIX: prefix || null,
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
    prefix && url && privKey && adminThreshold && (adminPubkeys || adminAddresses),
);

const provider = new JsonRpcProvider(url);
const wallet = new Wallet(privKey, provider);

printLog('retrieving addresses');
const admins = [adminAddresses];
printObj({ admins });

const contracts = {};
const paramsAuth = [defaultAbiCoder.encode(['address[]', 'uint256[]', 'uint256'], [[adminAddresses], [1], [adminThreshold]])];
const paramsProxy = arrayify(defaultAbiCoder.encode(['address[]', 'uint8', 'bytes'], [admins, adminThreshold, '0x']));

console.log([
    defaultAbiCoder.encode(['address[]', 'uint256[]', 'uint256'], [['0xAE92f3b47dA60A57deA94970f5A8168405d31275'], [1], [adminThreshold]]),
]);

(async () => {
    printLog('fetching fee data');
    const feeData = await provider.getFeeData();
    printObj({ feeData });
    const options = getTxOptions(feeData, { maxFeePerGas, maxPriorityFeePerGas, gasPrice, gasLimit });
    printObj({ tx_options: options });
    printLog('loading contract factories');
    // the ABIs for the contracts below must be manually downloaded/compiled
    const gatewayFactory = await getContractFactory('AxelarGateway', wallet);
    const authFactory = await getContractFactory('AxelarAuthWeighted', wallet);
    const tokenDeployerFactory = await getContractFactory('TokenDeployer', wallet);
    const gatewayProxyFactory = await getContractFactory('AxelarGatewayProxy', wallet);
    printLog('contract factories loaded');
    printLog(`deploying auth contract`);
    const auth = await authFactory.deploy(paramsAuth).then((d) => d.deployed());
    printLog(`param of auth contract ${paramsAuth}`);
    printLog(`deployed auth at address ${auth.address}`);
    contracts.auth = auth.address;
    printLog(`deploying token deployer contract`);
    const tokenDeployer = await tokenDeployerFactory.deploy().then((d) => d.deployed());
    printLog(`deployed token deployer at address ${tokenDeployer.address}`);
    contracts.tokenDeployer = tokenDeployer.address;
    printLog(`deploying gateway implementation contract`);
    const gatewayImplementation = await gatewayFactory.deploy(auth.address, auth.address).then((d) => d.deployed());
    printLog(`param of gateway implementation contract  ${auth.address} ----- ${tokenDeployer.address})}`);
    printLog(`deployed gateway implementation at address ${gatewayImplementation.address}`);
    contracts.gatewayImplementation = gatewayImplementation.address;
    printLog(`deploying gateway proxy contract`);
    const gatewayProxy = await gatewayProxyFactory.deploy(gatewayImplementation.address, paramsProxy).then((d) => d.deployed());
    printLog(`param of gateway proxy contract  ${gatewayImplementation.address} ---- ${paramsProxy})}`);
    printLog(`deployed gateway proxy at address ${gatewayProxy.address}`);
    contracts.gatewayProxy = gatewayProxy.address;
    // printLog('transferring auth ownership');
    // // await auth.transferOwnership(gatewayProxy.address, options);
    // await auth.transferOwnership(gatewayProxy.address).then((tx) => tx.wait());
    // printLog('transferred auth ownership. All done!');
})()
    .catch((err) => {
        console.error(err);
    })
    .finally(() => {
        printObj({ contract_addresses: contracts });
    });
