const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
const { devChains } = require("../../helper-hardhat-config");

!devChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe, deployer, mockV3Aggregator;
      const SEND_VALUE = ethers.parseEther("1");
      beforeEach(async function () {
        await deployments.fixture(["all"]);
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer,
        );
      });
      describe("constructor", function () {
        it("sets the aggregator address correctly.", async function () {
          const txResponse = await fundMe.getPriceFeed();
          assert.equal(txResponse, mockV3Aggregator.target);
        });
      });
      describe("fund", function () {
        it("fails when you don't send enough ETH.", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!",
          );
        });
        it("updates the address to amount funded mapping.", async function () {
          await fundMe.fund({ value: SEND_VALUE });
          const txResponse = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(txResponse.toString(), SEND_VALUE);
        });
        it("adds funder to array of funders.", async function () {
          await fundMe.fund({ value: SEND_VALUE });
          const txResponse = await fundMe.getFunder(0);
          assert.equal(txResponse, deployer);
        });
      });
      describe("withdraw", function () {
        beforeEach(async function () {
          await fundMe.fund({ value: SEND_VALUE });
        });
        it("successfully withdraws funds from contract.", async function () {
          const contractStartingBalance =
            await fundMe.runner.provider.getBalance(fundMe.target);
          const deployerStartingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, gasPrice } = txReceipt;
          const gasCost = gasUsed * gasPrice;

          const contractEndingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          const deployerEndingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          assert.equal(contractEndingBalance, 0);
          assert.equal(
            (deployerStartingBalance + contractStartingBalance).toString(),
            (deployerEndingBalance + gasCost).toString(),
          );
        });
        it("successfully withdraws funds from contract with multiple funders.", async function () {
          const accounts = await ethers.getSigners();
          for (funderIndex = 1; funderIndex < 6; funderIndex++) {
            fundMeConnectedAccount = fundMe.connect(accounts[funderIndex]);
            await fundMeConnectedAccount.fund({ value: SEND_VALUE });
          }
          contractStartingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          deployerStartingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          const txResponse = await fundMe.withdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, gasPrice } = txReceipt;
          const gasCost = gasUsed * gasPrice;

          const contractEndingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          const deployerEndingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          assert.equal(contractEndingBalance, 0);
          assert.equal(
            (deployerStartingBalance + contractStartingBalance).toString(),
            (deployerEndingBalance + gasCost).toString(),
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (funderIndex = 1; funderIndex < 6; funderIndex++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[funderIndex]),
              0,
            );
          }
        });
        it("does not allow anyone else but the owner to withdraw funds.", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[2];
          const fundMeConnectedAttacker = await fundMe.connect(attacker);
          await expect(
            fundMeConnectedAttacker.withdraw(),
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
        });
        it("successfully withdraws funds cheaper from contract.", async function () {
          const contractStartingBalance =
            await fundMe.runner.provider.getBalance(fundMe.target);
          const deployerStartingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, gasPrice } = txReceipt;
          const gasCost = gasUsed * gasPrice;

          const contractEndingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          const deployerEndingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          assert.equal(contractEndingBalance, 0);
          assert.equal(
            (deployerStartingBalance + contractStartingBalance).toString(),
            (deployerEndingBalance + gasCost).toString(),
          );
        });
        it("successfully withdraws funds from contract cheaper with multiple funders.", async function () {
          const accounts = await ethers.getSigners();
          for (funderIndex = 1; funderIndex < 6; funderIndex++) {
            fundMeConnectedAccount = fundMe.connect(accounts[funderIndex]);
            await fundMeConnectedAccount.fund({ value: SEND_VALUE });
          }
          contractStartingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          deployerStartingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          const txResponse = await fundMe.cheaperWithdraw();
          const txReceipt = await txResponse.wait(1);
          const { gasUsed, gasPrice } = txReceipt;
          const gasCost = gasUsed * gasPrice;

          const contractEndingBalance = await fundMe.runner.provider.getBalance(
            fundMe.target,
          );
          const deployerEndingBalance =
            await fundMe.runner.provider.getBalance(deployer);

          assert.equal(contractEndingBalance, 0);
          assert.equal(
            (deployerStartingBalance + contractStartingBalance).toString(),
            (deployerEndingBalance + gasCost).toString(),
          );

          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (funderIndex = 1; funderIndex < 6; funderIndex++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[funderIndex]),
              0,
            );
          }
        });
      });
    });
