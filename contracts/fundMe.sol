//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./priceConverter.sol";

error notOwner();

contract fundMe {
    using priceConverter for uint256;
    mapping(address => uint256) public nameToValue;
    address[] public funders;
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10**18;
    AggregatorV3Interface public priceFeed;

    constructor(AggregatorV3Interface priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert notOwner();
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getPriceConverter(priceFeed) >= MINIMUM_USD,
            "need to add more ETH"
        );
        nameToValue[msg.sender] += msg.value;
        funders.push(msg.sender);
    }

    function withDraw() public payable onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            address funder = funders[i];
            nameToValue[funder] = 0;
        }
        funders = new address[](0);

        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheapWithDraw() public payable onlyOwner {
        address[] memory funderr = funders;
        for (uint256 i = 0; i < funderr.length; i++) {
            address funder = funderr[i];
            nameToValue[funder] = 0;
        }
        funderr = new address[](0);

        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }
}
