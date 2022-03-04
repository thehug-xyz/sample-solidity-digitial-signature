const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect } = chai;

const { ethers } = require("hardhat");
const { soliditySha3 } = require("web3-utils");

const APPROVAL_ERROR = "VM Exception while processing transaction: reverted with reason string 'You must be approved to set the greeting'";

const signUserApproval = async (signer, address) => {
  const messageHash = soliditySha3(address);
  const messageHashBytes = ethers.utils.arrayify(messageHash);
  const flatSig = await signer.signMessage(messageHashBytes);
  return flatSig;
}

describe("Greeter", async () => {

  let contract;
  let owner;
  let user;
  let other;
  let approver;

  beforeEach(async () => {
    const Greeter = await hre.ethers.getContractFactory("Greeter");
    contract = await Greeter.deploy();
    const [owner1, user1, other1] = await hre.ethers.getSigners();
    owner = owner1;
    user = user1;
    other = other1;
    approver = ethers.Wallet.createRandom();
  })

  it("can send a greening when approvals are disabled", async () => {
    await contract.connect(user).setGreeting("Brand New Message");
    expect(await contract.greet()).to.eq("Brand New Message");
  });

  it("can not send a greening when approvals are required", async () => {
    await contract.connect(owner).setApproverAddress(approver.address);
    await expect(
      contract.connect(user).setGreeting("Brand New Message")
    ).to.eventually.be.rejectedWith(APPROVAL_ERROR);
  });

  it("can send a greening when approvals are required and approval is provided", async () => {
    const approval = signUserApproval(approver, user.address);
    await contract.connect(owner).setApproverAddress(approver.address);
    await contract.connect(user).setGreetingWithApproval("Brand New Message", approval);
  });

  it("cannot send a greening when other users approval is sent", async () => {
    const approval = signUserApproval(approver, other.address)
    await contract.connect(owner).setApproverAddress(approver.address);
    await expect(
      contract.connect(user).setGreetingWithApproval("Brand New Message", approval)
    ).to.eventually.be.rejectedWith(APPROVAL_ERROR);
  });

  it("cannot send a greening when a different wallet is used to approve", async () => {
    const fakeApprover = ethers.Wallet.createRandom();
    const approval = signUserApproval(fakeApprover, other.address)
    await contract.connect(owner).setApproverAddress(approver.address);
    await expect(
      contract.connect(user).setGreetingWithApproval("Brand New Message", approval)
    ).to.eventually.be.rejectedWith(APPROVAL_ERROR);
  });

});
