// Import the ethers package from Hardhat
const { ethers } = require("hardhat");

// Asynchronous function to deploy the Lock contract
async function main() {
    // Get the deployer's signer account
    const [deployer] = await ethers.getSigners();

    // Get the Lock contract factory
    const Lock = await ethers.getContractFactory("Lock");

    // Deploy the Lock contract
    const lock = await Lock.deploy();

    // Print the deployed Lock contract's address
    console.log("Lock deployed to:", lock.address);
}

// Call the main function and handle success or error cases
main()
    .then(() => process.exit(0)) // Exit the process if deployment is successful
    .catch(error => {
        // Log the error and exit the process with a non-zero status code
        console.error(error);
        process.exit(1);
    });