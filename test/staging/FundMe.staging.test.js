const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert } = require("chai");
const { devChains } = require("../../helper-hardhat-config");

devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe, deployer;
      const SEND_VALUE = ethers.parseEther("0.1");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });
      it("allows to fund and withdraw from contract.", async function () {
        const fundTxResponse = await fundMe.fund({ value: SEND_VALUE });
        await fundTxResponse.wait(1);
        const withdrawTxResponse = await fundMe.withdraw();
        await withdrawTxResponse.wait(1);

        const contractEndBalance = await fundMe.runner.provider.getBalance(
          fundMe.target,
        );

        assert.equal(contractEndBalance.toString(), "0");
      });
    });
