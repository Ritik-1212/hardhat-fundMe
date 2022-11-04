const { assert, expect } = require("chai");
const { serializeTransaction } = require("ethers/lib/utils");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { deploymentAddress } = require("../../helper-hardhat-deploy");

!deploymentAddress.includes(network.name)
  ? describe.skip
  : describe("fundMe", function () {
      let deployer;
      let fundMe;
      let mockV3Agregator;
      let sentValue = ethers.utils.parseEther("1");

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("fundMe", deployer);
        mockV3Agregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", function () {
        it("checks the constructor address price feed", async function () {
          const response = await fundMe.priceFeed();
          assert.equal(response, mockV3Agregator.address);
        });
      });
      describe("fundMe", function () {
        it("should check the fundMe function", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "need to add more ETH"
          );
        });
        it("should check if the funds sent by sender is stored", async function () {
          await fundMe.fund({ value: sentValue });
          const response = await fundMe.nameToValue(deployer);
          assert.equal(response.toString(), sentValue.toString());
        });
        it("should check if sender accounts are getting stored ", async function () {
          await fundMe.fund({ value: sentValue });
          const funder = await fundMe.funders(0);
          assert.equal(funder, deployer);
        });
      });
      describe("withDraw", function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sentValue });
        });
        it("should be able to withdraw from a single account", async function () {
          const startFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startDeployerValue = await fundMe.provider.getBalance(deployer);
          const transactionResponse = await fundMe.withDraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerValue = await fundMe.provider.getBalance(deployer);

          assert.equal(endFundMeValue, 0);
          assert.equal(
            startDeployerValue.add(startFundMeValue).toString(),
            endDeployerValue.add(gasCost).toString()
          );
        });
        it("should be able to withdraw from multiple accounts", async function () {
          const accounts = await ethers.getSigners();
          for (let i = 0; i < 6; i++) {
            const fundMeAccounts = await fundMe.connect(accounts[i]);
            await fundMeAccounts.fund({ value: sentValue });
          }
          const startingFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startDeployerValue = await fundMe.provider.getBalance(deployer);
          const transactionResponse = await fundMe.withDraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerValue = await fundMe.provider.getBalance(deployer);

          assert.equal(endFundMeValue, 0);
          assert.equal(
            startDeployerValue.add(startFundMeValue).toString(),
            endDeployerValue.add(gasCost).toString()
          );
          await expect(fundMe.funders(0)).to.be.reverted;
          for (i = 0; i < 6; i++) {
            assert.equal(await fundMe.nameToValue(accounts[i].address), 0);
          }
        });
        it("should only be withdrawable by the owner", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnected = await fundMe.connect(attacker);
          await expect(attackerConnected.withDraw()).to.be.revertedWith(
            "notOwner"
          );
        });
        it("should be able to cheapWithdraw from one account", async function () {
          const startingFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startDeployerValue = await fundMe.provider.getBalance(deployer);
          const transactionResponse = await fundMe.cheapWithDraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endFundMeValue = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endDeployerValue = await fundMe.provider.getBalance(deployer);

          assert.equal(endFundMeValue, 0);
          assert.equal(
            startDeployerValue.add(startFundMeValue).toString(),
            endDeployerValue.add(gasCost).toString()
          );
        });
      });
    });
