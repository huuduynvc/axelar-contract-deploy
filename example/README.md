# execute example

## overview flow

# 1. call contract on source chain

call goerli custom contract (ExecutableSample)
ExecutableSample call payNativeGasForContractCall on goerli gas service
Executablesample call contractCall(destinationChain, destinationContract, value) on goerli gateway proxy
goerli gateway emit event ContractCall

# 2. approve & execute on destination chain

call execute with approveContractCall command on fuji gateway contract
fuji gateway contract execute & emit event ContractCallApproved
fuji custom contract (ExecutableSample) call execute(sourceChain, sourceContract, value)
into execute, fuji custom contract call validateContractCall on fuji gateway contract to verify before execute

# run example-execute

node example/example-execute.js

# deploy ExecutableSample

file: /scripts/deploy-example.js
IMPORTANT: check rpc url, chain config, gateway contract, gas service contract
