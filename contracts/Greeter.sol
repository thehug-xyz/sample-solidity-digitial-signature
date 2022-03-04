pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Greeter is Ownable {
    string private greeting;
    address private approverAddress;
    using ECDSA for bytes32;

    constructor() {
        approverAddress = address(0);
        greeting = "Hello";
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setApproverAddress(address _approverAddress) external onlyOwner {
        approverAddress = _approverAddress;
    }

    function setGreeting(string memory _greeting) external {
        require(approverAddress == address(0), "You must be approved to set the greeting");
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function setGreetingWithApproval(string memory _greeting, bytes memory signature) external {
        if (approverAddress != address(0)) {
            require(_verifySenderApproved(signature) == approverAddress, "You must be approved to set the greeting");
        }
        console.log("Changing greeting from '%s' to '%s'", greeting, _greeting);
        greeting = _greeting;
    }

    function _verifySenderApproved(bytes memory signature) private view returns (address signer) {
        bytes32 hashedInsideContract = keccak256(abi.encodePacked(msg.sender));
        bytes32 messageDigest = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hashedInsideContract));
        return ECDSA.recover(messageDigest, signature);
    }
}
