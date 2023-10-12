const { ethers } = require('hardhat');
const {
    Wallet,
    providers: { JsonRpcProvider },
} = ethers;
require('dotenv').config();

const { getBytecodeHash } = require('@axelar-network/axelar-chains-config');
const { getWeightedProxyDeployParams } = require('../test/utils');

const contractUpgrade = async () => {
    const provider = new JsonRpcProvider(process.env.GOERLI_RPC_URL);
    const owner = new Wallet(process.env.PRIVATE_KEY, provider);

    const gatewayFactory = await ethers.getContractFactory('AxelarGateway', owner);
    const gateway = gatewayFactory.attach('0x137f6116A58D08730648242B204D06fcE94eff34'); // gateway proxy address

    const newGatewayImplementation = await gatewayFactory
        .deploy('0x739d86b6Fd8059503CC046f29dB7E6f50bf7fc04', '0x9A8168AfAc112593C3b155824474EA82c0d9a48d') // auth address, token deployer address
        .then((d) => d.deployed());
    const newGatewayImplementationCodeHash = await getBytecodeHash(newGatewayImplementation, 'ethereum-2');

    const params = '0x';
    const tx = await gateway.connect(owner).upgrade(newGatewayImplementation.address, newGatewayImplementationCodeHash, params);

    console.log(tx);
};

contractUpgrade();
