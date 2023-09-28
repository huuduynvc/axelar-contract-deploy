```bash
## install dependencies
npm ci
npm run build
npm i @axelar-network/axelar-cgp-solidity


## config hardhat network & etherscans
file: hardhat.config.js
- get etherscan key on etherscan.io
- get avalanche key on snowtrace.io
+ create account -> verify -> login -> access https://snowtrace.io/myapikey -> add new key


## deploy contract
files:
/script/deploy-gateway-v4.3.x.js
/script/deploy-gas-service.js


# goerli
npx hardhat run --network goerli scripts/deploy-gas-service.js

# fuji
npx hardhat run --network fuji scripts/deploy-gas-service.js


## verify contract
# add constructor params into args file (get from log of deploy)
files:
/args/axelar-gas-receiver-proxy.js
/args/axelar-gas-service.js
/args/axelar-gateway-proxy.js
/args/axelar-gateway.js

# goerli
npx hardhat --network goerli verify --constructor-args ./args/axelar-gas-receiver-proxy.js {DEPLOYED_CONTRACT_ADDRESS}

# fuji
npx hardhat --network fuji verify --constructor-args ./args/axelar-gas-receiver-proxy.js {DEPLOYED_CONTRACT_ADDRESS}
```

## deployed contract

# goerli

{
"contract_addresses": {
"auth": "0x4817c014FF3046FDFd36E38935b6D2b4d55b0874",
"gasService": "0x2E12c6CaFb9e2eC6Fd04A30Ea94b0dc901570170",
"gasReceiverProxy": "0xC47FD511FA38903942Ab1A395723f478Fe2F8E9C"
}
{
"contract_addresses": {
"auth": "0x18eCb482A47227A3d1252c57Fba648183b0374D0",
"tokenDeployer": "0x165C3F338169DF3Ad221ea7AE7db5a394D2E4011",
"gatewayImplementation": "0x8932A493Aa19095f8ae980c7e45bDe41F4708C89",
"gatewayProxy": "0xc1c7BF746C4cc5eC0b3777f4C255BF26252e9531"
}

# fuji

"contract_addresses": {
"auth": "0x4c8E322Ef1362B9994E64C1FA669e3F0204D2A59",
"gasService": "0x285F4a03DaBDAf795C6dd4bFdD0E9467e538B237",
"gasReceiverProxy": "0xeb672a3d81CC68caC11d7E25D2d96AC4C8ec6003"
}
{
"contract_addresses": {
"auth": "0x595E8Ee886D99e0eA5E711f6cA5FE5834EaB0C49",
"tokenDeployer": "0xA13E3b6aF3552B735b75c6C3Ad2538238d0a9847",
"gatewayImplementation": "0xDcA8EB36CF320A199C106Fb1109B90d0e4c23A50",
"gatewayProxy": "0xE14A8bbECCd75CF7a27A43A1b5abe9114251C03d"
}
