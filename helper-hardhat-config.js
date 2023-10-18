const networkConfig = {
  11155111: {
    name: "sepolia",
    EthUsdPriceFeedAddress: "0x694aa1769357215de4fac081bf1f309adc325306",
  },
};

const devChains = ["hardhat", "localhost"];

const MOCK_DECIMALS = "8";
const MOCK_INITIAL_ANSWER = "200000000000";

module.exports = {
  networkConfig,
  devChains,
  MOCK_DECIMALS,
  MOCK_INITIAL_ANSWER,
};
