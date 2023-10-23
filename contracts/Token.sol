// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Import the OpenZeppelin ERC20 standard token contract

contract BEEToken is ERC20 {
    constructor() ERC20("BEE Token", "BEE") {
        _mint(msg.sender, 1773000 * 10 ** decimals()); // When creating the BEEToken contract, it gives 1,773,000 BEE tokens to the owner
    }
}