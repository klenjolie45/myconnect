import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber, Contract } from "ethers"
import { ethers, network, deployments } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BuyMeACoffeeV1, MockV3Aggregator } from "../../typechain-types"

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
// DAI_WHALE must be an account, not contract
const DAI_WHALE = "0x28C6c06298d514Db089934071355E5743bf21d60" // Binance 14 account

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("forked mainnet unit tests", () => {
          let [deployer, alice, bob, whale]: SignerWithAddress[] = []
          let buyMeACoffeeV1: BuyMeACoffeeV1
          let daiPriceFeed: MockV3Aggregator

          before(async () => {
              ;[deployer, alice, bob] = await ethers.getSigners()

              await network.provider.request({
                  method: "hardhat_impersonateAccount",
                  params: [DAI_WHALE],
              })

              whale = await ethers.getSigner(DAI_WHALE)
          })

          beforeEach(async () => {
              await deployments.fixture(["all"])
              const proxy = await ethers.getContract(
                  "BuyMeACoffeeProxy",
                  deployer
              )
              buyMeACoffeeV1 = await ethers.getContractAt(
                  "BuyMeACoffeeV1",
                  proxy.address
              )

              //   daiPriceFeed = await ethers.getContract("MockV3Aggregator")
              const MockV3Aggregator = await ethers.getContractFactory(
                  "MockV3Aggregator"
              )
              const mockPriceFeed = await MockV3Aggregator.deploy(
                  8,
                  1 * 10 ** 8
              )
              daiPriceFeed = await ethers.getContractAt(
                  "MockV3Aggregator",
                  mockPriceFeed.address
              )
          })

          describe("Buying Coffee with ERC20", () => {
              it("Should buy a coffee with the correct amount of ERC20 tokens", async () => {
                  await buyMeACoffeeV1.setERC20Token(
                      [DAI],
                      [daiPriceFeed.address]
                  )

                  // Set the coffee price in USD and units to buy
                  const units = BigNumber.from(5)
                  const coffeePriceInUSD = BigNumber.from(5)
                  const decimals = BigNumber.from(10).pow(18)

                  const { answer: priceFeed } =
                      await daiPriceFeed.latestRoundData()

                  // Calculate the required ERC20 tokens to buy the coffee1)
                  const requiredERC20 = units
                      .mul(coffeePriceInUSD)
                      .mul(decimals)
                      .div(priceFeed)

                  // Approve before send tx
                  const daiContract = await ethers.getContractAt(
                      "MockERC20",
                      DAI
                  )
                  await daiContract
                      .connect(whale)
                      .approve(buyMeACoffeeV1.address, requiredERC20)

                  const txResponse = await buyMeACoffeeV1
                      .connect(whale)
                      .buyCoffeeERC20(DAI, units, "Whale with DAI")

                  const txReceipt = await txResponse.wait(1)
                  const { token, buyer, amount, message } =
                      txReceipt.events![1].args!

                  expect(token).to.equal(DAI)
                  expect(message).to.equal("Whale with DAI")
                  expect(amount).to.equal(requiredERC20)
                  expect(buyer).to.equal(whale.address)
              })
          })
      })
