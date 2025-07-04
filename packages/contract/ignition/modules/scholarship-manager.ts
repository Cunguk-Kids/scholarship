import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toHex } from "viem";

export default buildModule("ScholarshipManagerModule", (m) => {
  const donaterNFT = m.contract("ScholarshipDonaterNFT");
  const studentNFT = m.contract("ScholarshipStudentNFT");

  const programImplementation = m.contract("ScholarshipProgram");

  const manager = m.contract("ScholarshipManager", [
    programImplementation,
    donaterNFT,
    studentNFT,
  ]);

  const minterRole = keccak256(toHex("MINTER_ROLE"));

  m.call(donaterNFT, "grantRole", [minterRole, manager]);
  m.call(studentNFT, "grantRole", [minterRole, manager]);

  return { donaterNFT, studentNFT, manager };
});
