const networkConfig = {
  5: {
    name: "goerli",
    ethUSDpricefeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};
const deploymentAddress = ["hardhat", "localhost"];
const DECIMALS = 3;
const INITIAL_NUMBER = 20000000000;

module.exports = {
  networkConfig,
  deploymentAddress,
  DECIMALS,
  INITIAL_NUMBER,
};
