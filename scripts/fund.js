const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("fundMe", deployer);
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("0.1"),
  });
  await transactionResponse.wait(1);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
