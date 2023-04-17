import { HardhatRuntimeEnvironment } from "hardhat/types"
import { Address, DeployFunction } from "hardhat-deploy/types"

import { getNamedAccounts, deployments } from "hardhat"
import { developmentChains } from "../helper-hardhat-config"

const deployMockERC20: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deploy, log } = hre.deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(hre.network.name)) {
        log("Local network detected! Deploying Mocks ERC20...")

        const token = await deploy("MockERC20", {
            contract: "MockERC20",
            from: deployer,
            args: [],
            log: true,
            waitConfirmations: 1,
        })

        // deploy mock v3 aggregator for MockERC20 token
        // const decimals = 18
        // const initAnswer = 50 * 10 ** 8
        // await deploy("MockV3Aggregator", {
        //     contract: "MockV3Aggregator",
        //     from: deployer,
        //     args: [decimals, initAnswer],
        //     log: true,
        //     waitConfirmations: 1,
        // })

        log("----------------------------------------------------")
    }
}

export default deployMockERC20
deployMockERC20.tags = ["all", "MockERC20", "mocks"]
