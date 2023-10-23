// Include the Hardhat-Waffle library in the project
require("@nomiclabs/hardhat-waffle");

// Hardhat configuration
module.exports = {
    // Specify the Solidity version
    solidity: "0.8.20",

    // Network configurations to connect to different networks
    networks: {
        // Configuration for the Mainnet network
        mainnet: {
            // Mainnet RPC endpoint address
            url: `https://api.avax.network/ext/bc/C/rpc`,
            // If transactions need to be performed with a private key, it can be specified within the accounts array
            // accounts: [`${PRIVATE_KEY}`]
        },
        // Configuration for the Fuji test network
        fuji: {
            // Fuji test network RPC endpoint address
            url: `https://api.avax-test.network/ext/bc/C/rpc`,
            // If transactions need to be performed with a private key, it can be specified within the accounts array
            // accounts: [`${PRIVATE_KEY}`]
        }
    }
};