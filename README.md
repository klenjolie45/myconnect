# Buy Me A Coffee ☕

A Solidity smart contract that allows users to buy coffee using Ether or supported ERC20 tokens. The contract leverages Chainlink Oracles to determine the required amount of Ether or ERC20 tokens for a given number of coffee units. The contract owner can update the supported ERC20 tokens and their respective price feeds. The contract also provides withdrawal functionality for the contract owner.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Built With](#built-with)
- [License](#license)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- `Node.js`: You will need Node.js version 12 or higher. You can download the latest version of Node.js from the official website.  
    [Node.js](https://nodejs.org/en/) 

### Installation

1. Clone the repo
 
```bash
git clone https://github.com/neeyno/hh-buyMeACoffee.git  
```  
2. Install NPM packages
```bash
npm install
```  
3. Configuring the `.env` file.  
    To configure your environment variables, follow these steps:

    1. Create a new file named `.env` in the root directory of your project (if it doesn't exist already).

    2. Open the .env file using your favorite text editor.

    3. Add the required environment variables, each on a new line, in the following format: `KEY=VALUE` 
    ```bash
    # example
    ETHERSCAN_API_KEY=Your_Etherscan_API_key
    ``` 
## Usage

1. Compile the smart contracts
```bash
npx hardhat compile 
```

2. Run a local development network
```bash
npx hardhat node
```

3. Deploy the smart contracts to the local network
```bash
npx hardhat deploy --network localhost 
```

## Testing

To run the tests, execute the following command:
```bash
npx hardhat test 
```

## Deployment

To deploy the smart contract to a live network, follow these steps:

1. Update the `hardhat.config.js` file with the desired network configuration.

2. Deploy the smart contract to the specified network
```bash
npx hardhat deploy --network <network_name> 
```

## Built With

- [Solidity](https://soliditylang.org/)
- [Hardhat](https://hardhat.org/)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
- [Chainlink](https://chain.link/)

## License

This project is licensed under the MIT License. 