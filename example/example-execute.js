const { ethers } = require('hardhat');
const {
    utils: { defaultAbiCoder, keccak256 },
    Wallet,
    getContractAt,
    providers: { JsonRpcProvider },
} = ethers;

const { getSignedWeightedExecuteInput, buildCommandBatch, getApproveContractCall, getGasOptions, getRandomID } = require('../test/utils');
const goerliChainId = 5;
const goerliRpcUrl = 'https://eth-goerli.g.alchemy.com/v2/u1WmstiSjUmEYFMr_x8bxqMpwsZYCbJW';

const privateKey = '0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144';

const srcChain = 'Avalanche';
const srcContract = '0x0D4C7DDBff6a26619F865Ed53CE620f715e7F31b';

const desChain = 'Avalanche';
const desContract = '0x2Fd391576beBDbEEBa7378229fb92938EFf133E5'; // '0x6c15f7b26C2b14C0B3f7dC3CCF3d283EF2dA0C2E';

const goerliGatewayContract = '0x8932A493Aa19095f8ae980c7e45bDe41F4708C89';

const deployGateway = async (proxyContractAddress, rpcUrl) => {
    const provider = new JsonRpcProvider(rpcUrl);
    const owner = new Wallet(privateKey, provider);

    const gatewayFactory = await ethers.getContractFactory('AxelarGateway', owner);

    return gatewayFactory.attach(proxyContractAddress);
};

const contractCall = async () => {
    const provider = new JsonRpcProvider(goerliRpcUrl);
    const owner = new Wallet(privateKey, provider);

    console.log('------contract call source gateway-----------');
    const sourceContractCall = await getContractAt('MessageSender', srcContract, owner);
    await sourceContractCall.sendMessage(desChain, desContract, 'hello world');
    console.log('--------done---------');
};

const approveAndExecuteMessage = async () => {
    const provider = new JsonRpcProvider(goerliRpcUrl);
    const owner = new Wallet(privateKey, provider);
    const destinationChainGateway = await deployGateway(goerliGatewayContract, goerliRpcUrl);

    console.log('------start-----------');

    const payload = defaultAbiCoder.encode(['string'], ['toi la mr duy']);
    const payloadHash = keccak256(payload);
    const commandId = getRandomID();
    console.log(commandId);
    const sourceTxHash = keccak256('0xcb07e89479df1fae2d99904f29996a6b8840f248151ab1bf1521dc768e000ece');
    const sourceEventIndex = 1;

    console.log('------build command batch-----------');

    const approveData = buildCommandBatch(
        goerliChainId,
        [commandId],
        ['approveContractCall'],
        [getApproveContractCall(srcChain, srcContract, owner.address, payloadHash, sourceTxHash, sourceEventIndex)],
    );

    console.log('------get signed weighted execute input-----------');

    const approveInput = await getSignedWeightedExecuteInput(approveData, [owner], [1], 1, [owner].slice(0, 1));

    console.log('------execute approve contract call-----------');
    await destinationChainGateway.execute(approveInput, getGasOptions()).then((tx) => tx.wait());

    console.log('------check approved-----------');
    const isApprovedInitiallyBefore = await destinationChainGateway.isContractCallApproved(
        commandId,
        srcChain,
        srcContract,
        owner.address,
        payloadHash,
    );
    console.log(isApprovedInitiallyBefore);

    console.log('------execute destination contract-----------');

    const destinationExecutable = await getContractAt('AxelarExecutable', desContract, owner);
    await destinationExecutable.execute(commandId, srcChain, srcContract, payload);

    console.log('--------done---------');
};

// contractCall();
approveAndExecuteMessage();
