# Sample Smart Contract with Digital Signature

This project demonstrates use of digital signatures to approve
wallets for smart contract function calls. You might use this
for the pre-sale phase of a mint.

```shell
yarn
yarn compile
yarn test
```

## How it works

Use setApproverAddress to specify that changing the greeting
requires approval. Set the value to the address of wallet if
approvals are required, and set it to address(0) if approvals
are not required.

The setGreeting function only works when approvals are not
required. You will get an error if you call the function when
approvals are required.

The setGreetingWithApproval function requires a signature
parameter. The signature is a hash of the wallet address
calling the smart contract function. The signature
must be created by the wallet that was set from
setApproverAddress.

## Production Implementation

This project is only an example of the digital signature mechanism. A real
production project might look like:

1. The user will connect their wallet
2. The user will digitally sign a message (eth_signTypedData_v4) to prove they own the wallet
3. The front end will send the user's wallet and signature to a back end service
4. The back end service will verify the user's signature (recoverTypedSignature_v4)
5. The back end service will create a digital signature to approve the user's wallet for minting
6. The front end will call the mint function with the signature from the back end service.

## Alternatives

### Approval Lists

Some smart contracts use a map or array of approved
addresses. This is the most "decentralized" way to create an approval
list because everything is stored on-chain. It's also the most
expensive because of the storage and gas requirements.

### Merkle Trees

Merkle trees can be used to reduce the gas required for approval lists.
You create a list of approved addresses off-chain and calculate the
root of the Merkle Tree for that list. Checking to see if someone is
approved is very gas efficient. Any changes to the list change the root
of the tree and will require a call to update the root within the tree.

## Digital Signatures

Digital signature is the most efficient and least "web3" method for
managing approvals. It's more efficient than Merkle Trees when the list
of approved wallets changes often. Wallets are approved off-chain and
the contract only needs to be updated if the signing wallet changes.
