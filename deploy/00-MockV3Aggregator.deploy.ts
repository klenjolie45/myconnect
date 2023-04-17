import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

import { getNamedAccounts, deployments } from "hardhat"

import {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} from "../helper-hardhat-config"

const deployMockV3Aggregator: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(hre.network.name)) {
        log("Local network detected! Deploying mocks...")

        const mockArgs = [DECIMALS, INITIAL_ANSWER]

        //deploy mocks
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: mockArgs,
            log: true,
            waitConfirmations: 1,
        })

        log(`----------------------------------------------------`)
    }
}

export default deployMockV3Aggregator

deployMockV3Aggregator.tags = ["all", "MockV3Aggregator", "mocks"]
