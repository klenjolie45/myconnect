// SPDX-License-Identifier: MIT

pragma solidity =0.8.18;

// import "@openzeppelin/contracts/utils/Address.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

interface IERC20decimals {
    function decimals() external view returns (uint8);
}

/**
 * @title BuyMeACoffee
 * @notice A smart contract that allows users to buy coffee using Ether or supported ERC20 tokens.
 * @dev The contract leverages Chainlink Oracles to determine the required amount of Ether or ERC20 tokens
 * for a given number of coffee units. The contract owner can update the supported ERC20 tokens and their respective price feeds.
 * The contract also provides withdrawal functionality for the contract owner.
 */
contract BuyMeACoffee is Ownable {
    error InsufficientEthValue();
    error InsufficientBalance();
    error InvalidValue();
    error TransferFailed(bytes data);
    error UnsupportedToken();

    // Event emitted when a user buys coffee using ETH
    event CoffeeBought(
        address indexed buyer,
        uint256 indexed amount,
        string message,
        uint256 timestamp
    );
    // Event emitted when a user buys coffee using an ERC20 token
    event CoffeeBoughtERC20(
        address indexed buyer,
        address indexed token,
        uint256 amount,
        string message,
        uint256 timestamp
    );
    // Event emitted when a payment is withdrawn from the contract balance (ETH)
    event PaymentSent(address indexed account, uint256 indexed amount);
    // Event emitted when a payment is withdrawn from the contract balance (ERC20)
    event ERC20PaymentSent(
        address indexed token,
        address indexed account,
        uint256 amount
    );
    // Event emitted when an ERC20 token and its price feed are added or updated
    event TokenUpdated(address indexed token, address indexed priceFeed);

    // State variables

    // The price of one coffee unit in USD, set to a constant value of 5 USD
    uint256 private constant _coffePrice = 5;

    // The address of the Chainlink ETH/USD price feed aggregator
    address private immutable _priceFeed;

    // A mapping of supported ERC20 token addresses to
    // their corresponding price feed aggregator addresses (USD)
    mapping(address tokenAddr => address priceFeedUSD) private _erc20PriceFeeds;

    // Modifiers
    modifier validInput(uint256 value) {
        if (value == 0) revert InvalidValue();
        _;
    }

    constructor(address priceFeedEthUsd) {
        _priceFeed = priceFeedEthUsd;
    }

    receive() external payable {
        emit CoffeeBought(msg.sender, msg.value, "", block.timestamp);
    }

    // External functions

    /**
     * @notice Buys coffee using Ether as payment.
     * @dev Calculates the required Ether amount based on the current ETH/USD price from the price feed.
     * The transaction value must be within 98% of the calculated required Ether amount.
     * Emits a CoffeeBought event.
     * @param units The number of coffee units to buy.
     * @param message An optional message from the buyer.
     * Requirements:
     * - `units` must be greater than 0.
     * - The transaction value must be at least 98% of the required Ether amount.
     */
    function buyCoffee(
        uint256 units,
        string memory message
    ) external payable validInput(units) {
        uint256 price = uint256(
            getLatestPrice(AggregatorV3Interface(_priceFeed))
        );
        uint256 requiredETH = (units * _coffePrice * 10 ** 18) / price;

        // uint256 minETH = (requiredETH * 98) / 100;
        if (msg.value < requiredETH) revert InsufficientEthValue();

        emit CoffeeBought(msg.sender, msg.value, message, block.timestamp);
    }

    /**
     * @notice Buys coffee using an ERC20 token as payment.
     * @dev Transfers the required amount of the specified ERC20 token from the sender to the contract.
     * The contract calculates the required amount based on the token's price in USD.
     * Emits a CoffeeBoughtERC20 event.
     * @param token The address of the ERC20 token to be used as payment.
     * @param units The number of coffee units to buy.
     * @param message An optional message from the buyer.
     * Requirements:
     * - `units` must be greater than 0.
     * - The contract must have an available price feed for the specified token.
     * - The sender must have enough token balance and allowance to cover the purchase.
     */
    function buyCoffeeERC20(
        address token,
        uint256 units,
        string memory message
    ) external validInput(units) {
        address priceFeed = _erc20PriceFeeds[token];
        if (priceFeed == address(0)) revert UnsupportedToken();

        uint8 decimals = IERC20decimals(token).decimals();
        uint256 price = uint256(
            getLatestPrice(AggregatorV3Interface(priceFeed))
        );

        uint256 requiredValue = (units * _coffePrice * (10 ** decimals)) /
            price;

        SafeERC20.safeTransferFrom(
            IERC20(token),
            msg.sender,
            address(this),
            requiredValue
        );

        emit CoffeeBoughtERC20(
            token,
            msg.sender,
            requiredValue,
            message,
            block.timestamp
        );
    }

    /**
     * @notice Withdraws the entire contract balance to the specified account.
     * @dev Sends the contract's balance to the provided `account`. Emits a PaymentSent event.
     * @param account The address of the account to receive the withdrawn funds.
     * Access is restricted to contract owner only.
     */
    function withdrawEth(address payable account) external onlyOwner {
        uint256 payment = address(this).balance;
        if (payment == 0) revert InsufficientBalance();

        (bool success, bytes memory data) = account.call{value: payment}("");
        if (!success) revert TransferFailed(data);

        emit PaymentSent(account, payment);
    }

    /**
     * @notice Withdraws the entire balance of a specified ERC20 token to the provided account.
     * @dev Transfers the entire balance of the specified `token` to the `account`. Emits an ERC20PaymentSent event.
     * Access is restricted to contract owner only.
     * @param token The ERC20 token address to be withdrawn.
     * @param account The address of the account to receive the withdrawn ERC20 tokens.
     */
    function withdrawERC20(IERC20 token, address account) external onlyOwner {
        uint256 erc20payment = token.balanceOf(address(this));
        if (erc20payment == 0) revert InsufficientBalance();

        SafeERC20.safeTransfer(token, account, erc20payment);

        emit ERC20PaymentSent(address(token), account, erc20payment);
    }

    /**
     * @notice Updates the price feed aggregator for an ERC20 token.
     * @dev Only callable by the contract owner.
     * @param token The address of the ERC20 token.
     * @param priceFeed The address of the price feed aggregator for the ERC20 token.
     * If the priceFeed is set to the zero address, the token will be removed from the supported tokens list.
     * Emits a TokenUpdated event.
     */
    function setERC20Token(
        address token,
        address priceFeed
    ) external onlyOwner {
        if (priceFeed != address(0)) {
            _erc20PriceFeeds[token] = priceFeed;
        } else {
            _erc20PriceFeeds[token] = address(0);
        }

        emit TokenUpdated(token, priceFeed);
    }

    function coffeePrice() public pure returns (uint256) {
        return _coffePrice;
    }

    function erc20PriceFeed(address token) external view returns (address) {
        return _erc20PriceFeeds[token];
    }

    function getLatestPrice(
        AggregatorV3Interface priceFeed
    ) public view returns (int256) {
        // prettier-ignore
        ( 
            /* uint80 roundID */,
            int256 price, 
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }
}
