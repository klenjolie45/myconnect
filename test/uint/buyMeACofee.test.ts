import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { BigNumber, Contract } from "ethers"
import { ethers, network, deployments } from "hardhat"
import { developmentChains } from "../../helper-hardhat-config"
import { BuyMeACoffeeV1, MockV3Aggregator } from "../../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("BuyMeACoffeeV1 unit tests", () => {
          let [deployer, alice, bob]: SignerWithAddress[] = []
          let buyMeACoffeeV1: BuyMeACoffeeV1
          let mockPriceFeed: MockV3Aggregator

          before(async () => {
              ;[deployer, alice, bob] = await ethers.getSigners()
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
              mockPriceFeed = await ethers.getContract("MockV3Aggregator")
          })

          describe("Initialization and Configuration", () => {
              it("correctly set the owner and priceFeed on deployment", async () => {
                  //   const owner = await buyMeACoffeeV1.owner()
                  //   expect(owner).to.equal(deployer.address)
                  const priceFeedAddr = await buyMeACoffeeV1.getPriceFeed()
                  expect(priceFeedAddr).to.equal(mockPriceFeed.address)

                  await expect(
                      buyMeACoffeeV1.connect(bob).withdrawEth(bob.address)
                  ).to.be.revertedWithCustomError(buyMeACoffeeV1, "NotOwner")
              })

              it("allows owner to set ERC20 tokens and their price feeds", async () => {
                  const token = await ethers.getContract("MockERC20")

                  const MockV3Aggregator = await ethers.getContractFactory(
                      "MockV3Aggregator"
                  )
                  const decimals = 8
                  const initAnswer = 50 * 10 ** 8
                  const erc20MockPriceFeed = await MockV3Aggregator.deploy(
                      decimals,
                      initAnswer
                  )
                  await erc20MockPriceFeed.deployed()

                  await buyMeACoffeeV1.setERC20Token(
                      [token.address],
                      [erc20MockPriceFeed.address]
                  )
                  const tokenPriceFeedAddr =
                      await buyMeACoffeeV1.erc20PriceFeed(token.address)

                  const tokenLatestPrice = await buyMeACoffeeV1.getLatestPrice(
                      tokenPriceFeedAddr
                  )
                  expect(tokenPriceFeedAddr).to.equal(
                      erc20MockPriceFeed.address
                  )
                  expect(tokenLatestPrice).to.equal(initAnswer)
              })
              it("should not allow non-owner to set ERC20 tokens", async () => {
                  await expect(
                      buyMeACoffeeV1
                          .connect(bob)
                          .setERC20Token(
                              [ethers.constants.AddressZero],
                              [ethers.constants.AddressZero]
                          )
                  ).to.be.revertedWithCustomError(buyMeACoffeeV1, "NotOwner")
              })
          })

          describe("Buying Coffee with Ether", () => {
              it("Should buy a coffee with the correct amount of ETH", async () => {
                  // Set the coffee price in USD and units to buy
                  const units = BigNumber.from(1)
                  const coffeePriceInUSD = BigNumber.from(5)
                  const decimals = BigNumber.from(10).pow(18)
                  const { answer: priceFeed } =
                      await mockPriceFeed.latestRoundData()

                  // Calculate the required ETH to buy the coffee1)
                  const requiredETH = units
                      .mul(coffeePriceInUSD)
                      .mul(decimals)
                      .div(priceFeed)

                  const txResponse = await buyMeACoffeeV1
                      .connect(alice)
                      .buyCoffee(units, "Alice", { value: requiredETH })
                  const txReceipt = await txResponse.wait(1)
                  const { buyer, amount, message } = txReceipt.events![0].args!

                  //   const event = buyMeACoffeeV1.interface.parseLog(
                  //       txReceipt.logs[0]
                  //   )
                  // const { buyer, amount, message } = event.args

                  expect(message).to.equal("Alice")
                  expect(amount).to.equal(requiredETH)
                  expect(buyer).to.equal(alice.address)

                  //   await expect(
                  //       buyMeACoffeeV1
                  //           .connect(alice)
                  //           .buyCoffee(units, "Test message", {
                  //               value: requiredETH,
                  //           })
                  //   )
                  //       .to.emit(buyMeACoffeeV1, "CoffeeBought")
                  //       .withArgs(alice.address, requiredETH, "Test message")
              })

              it("Should fail to buy coffee with insufficient ETH", async () => {})
              it("Should fail to buy coffee with zero units", async () => {})
              it("Should emit the CoffeeBought event when buying coffee with ETH", async () => {})
          })

          describe("Buying Coffee with Ether", () => {
              it("Should buy a coffee with the correct amount of ERC20 tokens", async () => {})

              it("Should fail to buy coffee with unsupported ERC20 tokens", async () => {})
              it("Should fail to buy coffee with insufficient ERC20 token balance", async () => {})
              it("Should fail to buy coffee with zero units using ERC20 tokens", async () => {})
              it("Should emit the CoffeeBoughtERC20 event when buying coffee with ERC20 tokens", async () => {})
          })
      })
/* 
Initialization and Configuration
it("Should correctly set the owner and priceFeed on deployment", async () => {})
it("Should allow owner to set ERC20 tokens and their price feeds", async () => {})
it("Should not allow non-owner to set ERC20 tokens and their price feeds", async () => {})

Buying Coffee with Ether

it("Should buy a coffee with the correct amount of ETH", async () => {})
it("Should fail to buy coffee with insufficient ETH", async () => {})
it("Should fail to buy coffee with zero units", async () => {})
it("Should emit the CoffeeBought event when buying coffee with ETH", async () => {})

Buying Coffee with ERC20 Tokens

it("Should buy a coffee with the correct amount of ERC20 tokens", async () => {})
it("Should fail to buy coffee with unsupported ERC20 tokens", async () => {})
it("Should fail to buy coffee with insufficient ERC20 token balance", async () => {})
it("Should fail to buy coffee with zero units using ERC20 tokens", async () => {})
it("Should emit the CoffeeBoughtERC20 event when buying coffee with ERC20 tokens", async () => {})

Withdrawals

it("Should allow owner to withdraw ETH balance", async () => {})
it("Should not allow non-owner to withdraw ETH balance", async () => {})
it("Should allow owner to withdraw ERC20 token balance", async () => {})
it("Should not allow non-owner to withdraw ERC20 token balance", async () => {})
 */
