// SPDX-License-Identifier: MIT

pragma solidity =0.8.18;

import {Proxy} from "@openzeppelin/contracts/proxy/Proxy.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ImplementationStorage, AppStorage} from "../libraries/AppStorageLib.sol";

/**
 * @title BuyMeACoffeeProxy
 * @notice A proxy contract that enables upgradeability for the BuyMeACoffee smart contract.
 *      This contract handles delegating calls to the current implementation and managing ownership.
 * @dev The contract inherits from OwnableUpgradeable and Proxy. It stores the current implementation address
 *      and delegates calls to it. The contract owner can update the implementation,
 *      providing an upgrade path for the BuyMeACoffee contract.
 */
contract BuyMeACoffeeProxy is OwnableUpgradeable, Proxy {
    /**
     * @notice Sets the implementation address of the BuyMeACoffee contract.
     * @dev Can only be called by the contract owner.
     * @param newImplem The address of the new implementation.
     */
    function setImplementation(address newImplem) external onlyOwner {
        ImplementationStorage.layout().implementation = newImplem;
    }

    /**
     * @notice Gets the current implementation address of the BuyMeACoffee contract.
     * @return The address of the current implementation.
     */
    function getImplementation() external view returns (address) {
        return _implementation();
    }

    /**
     * @notice Initializes the proxy contract with the initial state.
     * @dev Can only be called once, using the initializer modifier.
     */
    function init() external initializer {
        __Ownable_init();

        AppStorage.layout().coffeePrice = 5;
    }

    /**
     * @dev Internal function to get the current implementation address.
     * @return The address of the current implementation.
     */
    function _implementation() internal view override returns (address) {
        return ImplementationStorage.layout().implementation;
    }

    /**
     * @dev Internal function to handle the fallback mechanism and delegate calls to the current implementation.
     */
    function _fallback() internal override {
        // _beforeFallback();
        _delegate(_implementation());
    }
}
