require('@nomicfoundation/hardhat-toolbox');
require('solidity-coverage');
require('dotenv').config();

if (process.env.STORAGE_LAYOUT) {
    require('hardhat-storage-layout');
}

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
            url: `${process.env.GOERLI_RPC_URL}`,
            accounts: [`${process.env.PRIVATE_KEY}`],
            chainId: 5,
            gas: 2100000,
            gasPrice: 8000000000,
        },
        fuji: {
            url: `${process.env.FUJI_RPC_URl}`,
            gasPrice: 225000000000,
            chainId: 43113,
            accounts: [`${process.env.PRIVATE_KEY}`],
        },
        linea_testnet: {
            url: `${process.env.LINEA_RPC_URL}`,
            accounts: [`${process.env.PRIVATE_KEY}`],
            gas: 2100000,
            gasPrice: 8000000000,
        },
        // add new config chain
    },
    etherscan: {
        apiKey: {
            goerli: process.env.GOERLI_SCAN_KEY,
            avalancheFujiTestnet: process.env.FUJI_SCAN_KEY,
            linea_testnet: process.env.LINEA_SCAN_KEY,
            // add new config explorer
        },
        customChains: [
            {
                network: 'linea_testnet',
                chainId: 59140,
                urls: {
                    apiURL: 'https://api-testnet.lineascan.build/api',
                    browserURL: 'https://goerli.lineascan.build/address',
                },
            },
        ],
    },
    mocha: {
        timeout: 4 * 60 * 60 * 1000, // 4 hrs
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
    },
};
