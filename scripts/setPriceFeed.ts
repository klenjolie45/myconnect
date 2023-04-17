import { ethers } from "hardhat"
import { Address } from "hardhat-deploy/types"

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("Account balance:", (await deployer.getBalance()).toString())

    console.log("Setting price feed...")

    const proxy = await ethers.getContract("BuyMeACoffeeProxy", deployer)

    const BuyMeACoffeeV1 = await ethers.getContractFactory("BuyMeACoffeeV1")
    const buyMeACoffeeV1 = await BuyMeACoffeeV1.attach(proxy.address)

    const tokens: Address[] = ["0xE097d6B3100777DC31B34dC2c58fB524C2e76921"] // mumbai TetherToken
    const priceFeeds: Address[] = ["0x572dDec9087154dC5dfBB1546Bb62713147e0Ab0"] // USDC / USD

    await buyMeACoffeeV1.setERC20Tokens(tokens, priceFeeds)

    console.log("Done!")

    process.exit(0) // exit Node process without error
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
