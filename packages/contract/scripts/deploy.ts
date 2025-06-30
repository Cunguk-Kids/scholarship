import { network } from "hardhat";

async function deploy() {
  const { viem } = await network.connect({ network: "localhost" });
  console.log("Deploying to localhost");
  console.log("Deploying ScholarshipDonaterNFT");
  const donaterNFT = await viem.deployContract("ScholarshipDonaterNFT");
  console.log("Deploying ScholarshipManager");
  const manager = await viem.deployContract("ScholarshipManager", [
    donaterNFT.address,
  ]);
  console.log("Transferring ownership of DonaterNFT to ScholarshipManager");
  const minterRole = await donaterNFT.read.MINTER_ROLE();
  donaterNFT.write.grantRole([minterRole, manager.address]);

  console.log("DonaterNFT:", donaterNFT.address);
  console.log("Manager:", manager.address);
}

void deploy();
