// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

/**
 * @title ImplementationStorage
 * @notice A library for managing the storage of the implementation address in the BuyMeACoffeeProxy contract.
 * @dev This library utilizes the ERC-1967 standard for proxy storage slots.
 *      It defines a struct for storing the implementation address and provides a function to access the struct in storage.
 */
library ImplementationStorage {
    struct Layout {
        address implementation;
    }

    bytes32 internal constant STORAGE_SLOT =
        keccak256("BuyMeACoffeeProxy.contracts.storage.Implementation");

    function layout() internal pure returns (Layout storage sl) {
        bytes32 slot = STORAGE_SLOT;
        assembly {
            sl.slot := slot
        }
    }
}

/**
 * @title AppStorage
 * @notice A library for managing the storage of application state in the BuyMeACoffeeProxy contract.
 */
library AppStorage {
    /**
     * @dev A struct that holds the application state variables.
     */
    struct Layout {
        uint256 coffeePrice;
        mapping(address => address) erc20PriceFeeds;
    }

    bytes32 internal constant APP_STORAGE_SLOT =
        keccak256("BuyMeACoffeeProxy.contracts.storage.AppStorage");

    /**
     * @notice Retrieves the storage layout for the application state.
     * @return sl The layout of the application storage.
     */
    function layout() internal pure returns (Layout storage sl) {
        bytes32 slot = APP_STORAGE_SLOT;
        assembly {
            sl.slot := slot
        }
    }
}
