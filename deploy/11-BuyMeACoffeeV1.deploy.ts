import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

import { getNamedAccounts, deployments, ethers } from "hardhat"
import { confirmationsNum, networkConfig } from "../helper-hardhat-config"

const deployV1: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = await hre.getChainId()

    const args = [networkConfig[chainId].priceFeed]

    const implementation = await deploy("BuyMeACoffeeV1", {
        contract: "BuyMeACoffeeV1",
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: confirmationsNum(hre.network.name),
    }) // implementation contract

    log(chainId + " priceFeed: " + networkConfig[chainId].priceFeed)

    log("Setting implementation...")

    const proxy = await ethers.getContract("BuyMeACoffeeProxy") // proxy contract
    const tx = await proxy.setImplementation(implementation.address) // set implementation
    await tx.wait()

    log("Implementation set! " + (await proxy.getImplementation()))

    log(`----------------------------------------------------`)
}

export default deployV1
deployV1.tags = ["all", "v1", "mainnet"]
