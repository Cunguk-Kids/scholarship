import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ScholarshipManagerModule", (m) => {
  const donaterNFT = m.contract("ScholarshipDonaterNFT");
  const studentNFT = m.contract("ScholarshipStudentNFT");

  const programImplementation = m.contract("ScholarshipProgram");

  const manager = m.contract("ScholarshipManager", [programImplementation]);

  const donaterMinterRole = m.staticCall(donaterNFT, "MINTER_ROLE");
  const studentMinterRole = m.staticCall(studentNFT, "MINTER_ROLE");
  m.call(donaterNFT, "grantRole", [donaterMinterRole, manager]);
  m.call(studentNFT, "grantRole", [studentMinterRole, manager]);

  return { donaterNFT, studentNFT, manager };
});
