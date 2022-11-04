//SPDX-License-Identifier : MIT

// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library priceConverter {
    function getPrice(AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        (, int256 answer, , , ) = priceFeed.latestRoundData();
        // ETH/USD rate in 18 digit
        return uint256(answer * 10000000000);
        // or (Both will do the same thing)
        // return uint256(answer * 1e10); // 1* 10 **
    }

    function getPriceConverter(uint256 price, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        uint256 priceget = getPrice(priceFeed);
        uint256 convertedPrice = ((price * priceget) / 1000000000000000000);
        return convertedPrice;
    }
}
