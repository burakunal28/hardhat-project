const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

// Helper function that converts a value with Ethereum value into a numeric value
function ethToNum(val) {
    return Number(ethers.utils.formatEther(val));
}

// Lock Contract test suite
describe("Lock Contract", function() {
    let owner, user1, user2; // Defined user roles: owner, user1, user2
    let Token, token; // BEEToken contract and its instance
    let Lock, lock; // Lock contract and its instance

    let balances; // User balances

    // Necessary resources are set up before the tests
    before(async function() {
        [owner, user1, user2] = await ethers.getSigners(); // Get user roles from ethers

        Token = await ethers.getContractFactory("BEEToken"); // BEEToken contract factory
        token = await Token.connect(owner).deploy(); // Deploy BEEToken contract by the owner user

        Lock = await ethers.getContractFactory("Lock"); // Lock contract factory
        lock = await Lock.connect(owner).deploy(token.address); // Deploy Lock contract by the owner user with the token address

        // Some tokens are sent to users
        token.connect(owner).transfer(user1.address, ethers.utils.parseUnits("100", 18)); 
        token.connect(owner).transfer(user2.address, ethers.utils.parseUnits("50")); 

        // Users approve the Lock contract
        token.connect(user1).approve(lock.address, ethers.constants.MaxUint256);
        token.connect(user2).approve(lock.address, ethers.constants.MaxUint256);
    });

    // User balances are updated before each test
    beforeEach(async function() {
        balances = [
            ethToNum(await token.balanceOf(owner.address)),
            ethToNum(await token.balanceOf(user1.address)),
            ethToNum(await token.balanceOf(user2.address)),
            ethToNum(await token.balanceOf(lock.address))
        ]
    });

    // Check if the Lock contract is deployed successfully
    it("Deploys Lock Contract", async function() {
        expect(token.address).to.not.be.undefined; // BEEToken contract address should be defined
        expect(lock.address).to.be.properAddress; // Lock contract address should be a valid Ethereum address
    });

    // Check if tokens are sent successfully
    it("Send Tokens", async function() {
        expect(balances[1]).to.be.equal(100); // The amount of tokens sent to user1 should be 100
        expect(balances[2]).to.be.equal(50); // The amount of tokens sent to user2 should be 50
        expect(balances[0]).to.be.greaterThan(balances[1]); // Remaining tokens of the owner should be greater than 100
    });

    // Check if approval is done successfully
    it("Approves", async function() {
        let allowance = [
            await token.allowance(user1.address, lock.address),
            await token.allowance(user2.address, lock.address)
        ]

        expect(allowance[0]).to.be.equal(ethers.constants.MaxUint256); // User1's allowance for Lock contract should be MaxUint256
        expect(allowance[0]).to.be.equal(allowance[1]); // Approval of user1 and user2 should be equal
    });

    it("Reverts exceeding transfer", async function() {
        // Direct transfer cannot be made through the Lock contract
        // Therefore, this operation should be done through the token contract
        await expect(token.connect(user1).transfer(user2.address, ethers.utils.parseUnits("300", 18))).to.be.reverted;
    });

    // Test suite for contract functions
    describe("Contract Functions", function() {
    
        // Variables to track locker count, total locked amount, and user locks
        let lockerCount = 0;
        let totalLocked = 0;
        let userLocks = [0, 0];

        // Test case: user1 locks 10 tokens
        it("user1 locks 10 tokens", async function() {
            // Increase total locked amount and user1's locked tokens
            totalLocked += 10;
            userLocks[0] += 10;
            lockerCount++;
            // Lock 10 tokens for user1
            await lock.connect(user1).lockTokens(ethers.utils.parseEther("10"));

            // Assertions: Check if the balances and locked token amounts are as expected
            expect(balances[3] + 10).to.be.equal(ethToNum(await token.balanceOf(lock.address)));
            expect(userLocks[0]).to.be.equal(ethToNum(await lock.lockers(user1.address)));
        });

        // Test case: Verify that locker count and total locked amount increase as expected
        it("Locker count and locked amount increase", async function() {
            // Assertions: Check if locker count and total locked amount are updated correctly
            expect(await lock.lockerCount()).to.be.equal(lockerCount);
            expect(ethToNum(await lock.totalLocked())).to.be.equal(totalLocked);
        });

        // Test case: user2 cannot withdraw tokens from the lock contract
        it("user2 cannot withdraw tokens", async function() {
            // Attempt to withdraw tokens for user2 and expect the transaction to be reverted
            await expect(lock.connect(user2).withdrawTokens()).to.be.reverted;
        });

        // Test case: user1 withdraws tokens
        it("user1 withdraws tokens", async function() {
            // Decrease total locked amount, reset user1's locked tokens and decrease locker count
            totalLocked -= userLocks[0];
            userLocks[0] = 0;
            lockerCount--;
            // User1 withdraws tokens from the lock contract
            await lock.connect(user1).withdrawTokens();

            // Assertions: Check if the balances and locked token amounts are updated correctly after withdrawal
            expect(balances[3] - 10).to.be.equal(ethToNum(await token.balanceOf(lock.address)));
            expect(userLocks[0]).to.be.equal(ethToNum(await lock.lockers(user1.address)));
        });

        // Test case: Verify that locker count and total locked amount decrease as expected
        it("Locker count and locked amount decrease", async function() {
            // Assertions: Check if locker count and total locked amount are updated correctly after withdrawal
            expect(await lock.lockerCount()).to.be.equal(lockerCount);
            expect(ethToNum(await lock.totalLocked())).to.be.equal(totalLocked);
        });

        // Test case: Verify that user1's position is deleted after withdrawal
        it("user1 position deleted", async function() {
            // Assertion: Check if user1's locked token amount is set to 0 after withdrawal
            expect(await lock.lockers(user1.address)).to.be.equal(0);
        });

        // Test case: user1 cannot withdraw more tokens after withdrawal
        it("user1 cannot withdraw more tokens", async function() {
            // Attempt to withdraw tokens for user1 again and expect the transaction to be reverted
            await expect(lock.connect(user1).withdrawTokens()).to.be.reverted;
        });

    });

    // Test case: Print the current timestamp
    it("Prints timestamp", async function() {
        // Get the current block number and fetch the block information
        let block_number = await provider.getBlockNumber();
        let block = await provider.getBlock(block_number);
        // Print the timestamp of the block
        console.log("timestamps:", block.timestamp);
    });

});