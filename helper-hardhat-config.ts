// import { BigNumber } from "ethers"
import { Address } from "hardhat-deploy/types"

type NetworkConfigItem = {
    name: string
    priceFeed: Address // price feed Native currency to USD
    // tokens: Address[]
    // erc20PriceFeeds: Address[]
}

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem
}

export const networkConfig: NetworkConfigMap = {
    default: {
        name: "hardhat",
        priceFeed: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // eth/usd
        // tokens: [],
        // erc20PriceFeeds: [],
    },
    31337: {
        name: "localhost",
        priceFeed: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // eth/usd
    },
    1: {
        name: "mainnet",
        priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // eth/usd
    },
    // 5: {
    //     name: "goerli",
    //     priceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e", // eth/usd
    // },
    11155111: {
        name: "sepolia",
        priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // eth/usd
    },
    // 137: {
    //     name: "polygon",
    //     priceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0", // matic/usd
    // },
    80001: {
        name: "polygonMumbai",
        priceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada", // matic/usd
    },
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6

export const INITIAL_ANSWER = 200000000000 //2000 $ * 10 ** 8
export const DECIMALS = 8

export const confirmationsNum = (networkName: string) => {
    return developmentChains.includes(networkName)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS
}
