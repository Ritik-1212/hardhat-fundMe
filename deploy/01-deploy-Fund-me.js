const { network } = require("hardhat");
const {
  networkConfig,
  deploymentAddress,
} = require("../helper-hardhat-deploy");
const { verify } = require("../utils/verify");

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let ethUSDpricefeedAddress;
  if (deploymentAddress.includes(network.name)) {
    const ethUSDAggregator = await deployments.get("MockV3Aggregator");
    ethUSDpricefeedAddress = ethUSDAggregator.address;
  } else {
    ethUSDpricefeedAddress = networkConfig[chainId]["ethUSDpricefeed"];
  }
  const args = [ethUSDpricefeedAddress];
  const fundME = await deploy("fundMe", {
    from: deployer,
    args: args,
    logs: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  if (
    !deploymentAddress.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundME.address, args);
  }
};
module.exports.tags = ["all", "fundMe"];
