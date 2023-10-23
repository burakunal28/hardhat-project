// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "./Token.sol"; // Import Token.sol file

contract Lock {
    BEEToken Token; // Variable of type BEEToken
    uint256 public lockerCount; // Number of locked accounts
    uint256 public totalLocked; // Total amount of locked tokens
    mapping(address => uint256) public lockers; // Mapping to store locked token amounts

    // Constructor for Lock contract, takes BEEToken address as a parameter
    constructor(address _tokenAddress) {
        Token = BEEToken(_tokenAddress); // Assign the Token address to the Token variable of type BEEToken
    }

    // Allows users to lock their tokens
    function lockTokens(uint256 amount) external {
        require(amount > 0, "Token amount must be greater than 0."); // Token amount to be locked must be greater than 0

        // You can add additional code here to check if the user has sufficient balance and allowance if needed
        // require(Token.balanceOf(msg.sender) >= amount, "Insufficient balance.");
        // require(Token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance.");

        // If the user has not locked tokens before, increase lockerCount
        if (!(lockers[msg.sender] > 0)) lockerCount++;
        totalLocked += amount; // Update total locked token amount
        lockers[msg.sender] += amount; // Update the user's locked token amount

        // Transfer the user's tokens to the smart contract, throw an error if the transfer fails
        bool ok = Token.transferFrom(msg.sender, address(this), amount);
        require(ok, "Transfer failed.");
    }

    // Allows users to withdraw their locked tokens
    function withdrawTokens() external {
        require(lockers[msg.sender] > 0, "Not enough token."); // Proceed only if the user has locked tokens
        uint256 amount = lockers[msg.sender]; // Get the user's locked token amount
        delete (lockers[msg.sender]); // Reset the user's locked token amount
        totalLocked -= amount; // Update total locked token amount
        lockerCount--; // Decrease locker count

        // Withdraw the user's tokens, throw an error if the transfer fails
        require(Token.transfer(msg.sender, amount), "Transfer failed.");
    }
}