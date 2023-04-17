import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"

import { getNamedAccounts, deployments } from "hardhat"
import { confirmationsNum } from "../helper-hardhat-config"

const deployProxy: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    // const chainId = await hre.getChainId()

    const proxy = await deploy("BuyMeACoffeeProxy", {
        contract: "BuyMeACoffeeProxy",
        from: deployer,
        log: true,
        args: [],
        waitConfirmations: confirmationsNum(hre.network.name),
    })

    const proxyContract = await hre.ethers.getContractAt(
        "BuyMeACoffeeProxy",
        proxy.address,
        deployer
    )

    await proxyContract.init() // init the proxy contract

    log(`----------------------------------------------------`)
    log(`Proxy Contract Address: ${proxy.address}`)
    log(`Proxy Contract Owner: ${await proxyContract.owner()}`)
    log(`----------------------------------------------------`)
}

export default deployProxy
deployProxy.tags = ["all", "proxy", "mainnet"]
