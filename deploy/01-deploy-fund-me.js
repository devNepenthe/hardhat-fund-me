require("dotenv").config();
const { networkConfig, devChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let EthUsdPriceFeedAddress;

  if (devChains.includes(network.name)) {
    EthUsdAggregator = await get("MockV3Aggregator");
    EthUsdPriceFeedAddress = EthUsdAggregator.address;
  } else {
    EthUsdPriceFeedAddress = networkConfig[chainId]["EthUsdPriceFeedAddress"];
  }

  const args = [EthUsdPriceFeedAddress];

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  if (!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args);
  }

  log("------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
