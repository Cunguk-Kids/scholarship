import { network } from "hardhat";

async function deploy() {
  const { viem } = await network.connect({ network: "localhost" });
  console.log("Deploying to localhost");
  console.log("Deploying ScholarshipDonaterNFT");
  const donaterNFT = await viem.deployContract("ScholarshipDonaterNFT");
  console.log("Deploying ScholarshipStudentNFT");
  const studentNFT = await viem.deployContract("ScholarshipStudentNFT");
  console.log("Deploying ScholarshipManager");
  const manager = await viem.deployContract("ScholarshipManager", [
    donaterNFT.address,
    studentNFT.address,
  ]);
  console.log("Transferring ownership of DonaterNFT to ScholarshipManager");
  const donaterMinterRole = await donaterNFT.read.MINTER_ROLE();
  const studentMinterRole = await studentNFT.read.MINTER_ROLE();
  donaterNFT.write.grantRole([donaterMinterRole, manager.address]);
  studentNFT.write.grantRole([studentMinterRole, manager.address]);

  console.log("DonaterNFT:", donaterNFT.address);
  console.log("StudentNFT:", studentNFT.address);
  console.log("Manager:", manager.address);
}

void deploy();
