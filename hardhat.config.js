require('@nomicfoundation/hardhat-toolbox');
require('solidity-coverage');
require('dotenv').config();
const { importNetworks, readJSON } = require('@axelar-network/axelar-chains-config');

if (process.env.STORAGE_LAYOUT) {
    require('hardhat-storage-layout');
}

const env = process.env.ENV || 'testnet';
// const chains = require(`@axelar-network/axelar-chains-config/info/${env}.json`);
// const keys = readJSON(`${__dirname}/keys.json`);
// const { networks, etherscan } = importNetworks(chains, keys);

console.log(process.env.PRIVATE_KEY);

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        version: '0.8.9',
        settings: {
            evmVersion: process.env.EVM_VERSION || 'london',
            optimizer: {
                enabled: true,
                runs: 1000,
                details: {
                    peephole: process.env.COVERAGE === undefined,
                    inliner: process.env.COVERAGE === undefined,
                    jumpdestRemover: true,
                    orderLiterals: true,
                    deduplicate: true,
                    cse: process.env.COVERAGE === undefined,
                    constantOptimizer: true,
                    yul: true,
                    yulDetails: {
                        stackAllocation: true,
                    },
                },
            },
        },
    },
    defaultNetwork: 'goerli',
    networks: {
        goerli: {
            url: 'https://eth-goerli.g.alchemy.com/v2/u1WmstiSjUmEYFMr_x8bxqMpwsZYCbJW',
            accounts: [`0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144`],
            chainId: 5,
        },
        fuji: {
            url: 'https://api.avax-test.network/ext/bc/C/rpc',
            gasPrice: 225000000000,
            chainId: 43113,
            accounts: [`0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144`],
        },
        // add new config chain
    },
    etherscan: {
        apiKey: {
            goerli: `D7UGFXZH6QFSTWIPJVA4Y1RZSB4S29H15M`,
            avalancheFujiTestnet: 'GA57W31F21RBNWTUDZV7RI9KF3VTSWP8BT',
            // add new config explorer
        },
    },
    mocha: {
        timeout: 4 * 60 * 60 * 1000, // 4 hrs
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
    },
};

// npx hardhat --network goerli verify --constructor-args ./args/axelar-auth-weighted.js 0x7c0E139Ca70eBF453F4Cb847b1bD78c75f381447
