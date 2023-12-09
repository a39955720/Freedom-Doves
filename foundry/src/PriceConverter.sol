// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title PriceConverter Library
 * @notice A library for converting prices using Chainlink price feeds
 */
library PriceConverter {
    /**
     * @dev Gets the latest price from the Chainlink price feed
     * @param priceFeed The Chainlink price feed contract
     * @return The latest price in AVAX with 18 decimals
     */
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        uint256 decimals = (18 - priceFeed.decimals());
        uint256 avaxPrice = uint256(answer) * (10 ** decimals);
        return avaxPrice;
    }

    /**
     * @dev Converts AVAX amount to USD
     * @param avaxAmount The amount of AVAX to convert
     * @param priceFeed The Chainlink price feed contract
     * @return The equivalent amount in USD
     */
    function getAvaxToUsd(
        uint256 avaxAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 avaxPrice = getPrice(priceFeed);
        uint256 avaxAmountInUsd = (avaxPrice * avaxAmount) / 10 ** 36;
        return avaxAmountInUsd;
    }

    /**
     * @dev Converts USD amount to AVAX
     * @param usdAmount The amount of USD to convert
     * @param priceFeed The Chainlink price feed contract
     * @return The equivalent amount in AVAX
     */
    function getUsdToAvax(
        uint256 usdAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 avaxPrice = getPrice(priceFeed);
        uint256 usdAmountInAvax = (usdAmount * 10 ** 36) / avaxPrice;
        return usdAmountInAvax;
    }
}
