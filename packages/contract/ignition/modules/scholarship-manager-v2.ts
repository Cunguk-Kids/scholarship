import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toHex } from "viem";

export default buildModule("ScholarshipManagerModuleV2", (m) => {
  const donaterNFT = m.contract("ProgramCreatorNFT");
  const studentNFT = m.contract("ApplicantNFT");

  const manager = m.contract("ScholarshipManagerV2", [
    "0x9b379eA3B4dEE91E1B0F2e5c36C0931cCDf227a0",
    studentNFT,
    donaterNFT,
  ]);

  const minterRole = keccak256(toHex("MINTER_ROLE"));

  m.call(donaterNFT, "grantRole", [minterRole, manager]);
  m.call(studentNFT, "grantRole", [minterRole, manager]);

  return { donaterNFT, studentNFT, manager };
});
