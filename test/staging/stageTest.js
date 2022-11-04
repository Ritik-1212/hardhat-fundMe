const { ethers, getNamedAccounts, network, deployments } = require("hardhat");
const { assert, expect } = require("chai");
const { deployementAddress } = require("../../helper-hardhat-deploy");
deployementAddress.includes(network.name)
  ? describe.skip
  : describe("fundMe", function () {
      let fundMe;
      let deployer;
      const sentValue = ethers.utils.parseEther("1");
      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("fundMe", deployer);
      });
      it("should be able to withdraw or fund from a single account", async function () {
        await fundMe.fund({ value: sentValue });
        await fundMe.withDraw();
        const endFundMeValue = await ethers.provider.getBalance(fundMe.address);
        assert.equal(endFundMeValue.toString(), "0");
      });
    });
