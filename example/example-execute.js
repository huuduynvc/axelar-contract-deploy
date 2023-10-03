const { ethers } = require('hardhat');
const {
    utils: { defaultAbiCoder, keccak256 },
    Wallet,
    getContractAt,
    providers: { JsonRpcProvider },
} = ethers;

const { getTxOptions } = require('../scripts/utils');

const { getSignedWeightedExecuteInput, buildCommandBatch, getApproveContractCall, getGasOptions, getRandomID } = require('../test/utils');

const privateKey = '0x7710afc48f3d13388d74e3e3140725e9a6124cc988199ed16c45d69cc651f144';

const goerliChainId = 5;
const goerliChainName = 'ethereum-2';
const goerliRpcUrl = 'https://eth-goerli.g.alchemy.com/v2/u1WmstiSjUmEYFMr_x8bxqMpwsZYCbJW';
const goerliGatewayContract = '0xc1c7BF746C4cc5eC0b3777f4C255BF26252e9531';
const goerliCustomContract = '0x3fEE1D666eb14D0701ceC6D2D234624c4C01b74C';

const fujiChainName = 'Avalanche';
const fujiChainId = 43113;
const fujiChainRpcUrl = 'https://api.avax-test.network/ext/bc/C/rpc';
const fujiCustomContract = '';
const fujiGatewayContract = '0xE14A8bbECCd75CF7a27A43A1b5abe9114251C03d';

// source chain config
const sourceChainId = goerliChainId;
const sourceChainRpc = goerliRpcUrl;
const sourceChainName = goerliChainName;
const sourceGatewayContract = goerliGatewayContract;
const sourceCustomContract = goerliCustomContract;

// destination chain config
const destinationChainId = goerliChainId;
const destinationChainRpc = goerliRpcUrl;
const destinationChainName = goerliChainName;
const destinationGatewayContract = goerliGatewayContract;
const destinationCustomContract = goerliCustomContract;

const deployGateway = async (proxyContractAddress, rpcUrl) => {
    const provider = new JsonRpcProvider(rpcUrl);
    const owner = new Wallet(privateKey, provider);

    const gatewayFactory = await ethers.getContractFactory('AxelarGateway', owner);

    return gatewayFactory.attach(proxyContractAddress);
};

const contractCall = async () => {
    const provider = new JsonRpcProvider(sourceChainRpc);
    const owner = new Wallet(privateKey, provider);

    console.log('------contract call source gateway-----------');
    const sourceContractCall = await getContractAt('ExecutableSample', sourceCustomContract, owner);
    await sourceContractCall.sendMessage(destinationChainName, destinationCustomContract, 'good morning');
    console.log('--------done---------');
};

const approveAndExecuteMessage = async () => {
    const provider = new JsonRpcProvider(destinationChainRpc);
    const owner = new Wallet(privateKey, provider);
    const destinationChainGateway = await deployGateway(destinationGatewayContract, destinationChainRpc);

    console.log('------start-----------');

    const payload = defaultAbiCoder.encode(['string'], ['good afternoon 1']);
    const payloadHash = keccak256(payload);
    const commandId = getRandomID();
    const sourceTxHash = keccak256('0x69a38e71ce125c1e205a958c33a61b17de25852ae497837034ddaed60a8a33ca');
    const sourceEventIndex = 1;

    console.log('------build command batch-----------');

    const approveData = buildCommandBatch(
        destinationChainId,
        [commandId],
        ['approveContractCall'],
        [
            getApproveContractCall(
                sourceChainName,
                sourceCustomContract,
                destinationCustomContract,
                payloadHash,
                sourceTxHash,
                sourceEventIndex,
            ),
        ],
    );

    console.log('------get signed weighted execute input-----------');

    const approveInput = await getSignedWeightedExecuteInput(approveData, [owner], [1], 1, [owner].slice(0, 1));

    console.log('------execute approve contract call-----------');
    await destinationChainGateway.execute(approveInput, getGasOptions()).then((tx) => tx.wait());

    console.log('------check approved-----------');
    const isApprovedInitiallyBefore = await destinationChainGateway.isContractCallApproved(
        commandId,
        sourceChainName,
        sourceCustomContract,
        destinationCustomContract,
        payloadHash,
    );
    console.log(isApprovedInitiallyBefore);

    console.log('------execute destination contract-----------');

    const tx = await (await ethers.getContractFactory('AxelarExecutable', owner))
        .attach(destinationCustomContract)
        .execute(commandId, sourceChainName, sourceCustomContract, payload);

    try {
        await tx.wait();
    } catch (err) {
        console.log(err);
    }

    console.log(`--------successfully executed call at tx ${tx.hash}`);
    console.log('--------done---------');
};

// contractCall();
approveAndExecuteMessage();
