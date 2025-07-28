import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toHex } from "viem";

export default buildModule("ScholarshipManagerModuleV2", (m) => {
  const donaterNFT = m.contractAt(
    "ProgramCreatorNFT",
    "0x6cB6d54108DfB4d8Dce2D8fAdbfe8465f222d3B5"
  );
  const studentNFT = m.contractAt(
    "ApplicantNFT",
    "0x282170e69DE842a323911c37716e28A878c1899F"
  );
  const usdc = m.contractAt(
    "MockUSDC",
    "0x9b379eA3B4dEE91E1B0F2e5c36C0931cCDf227a0"
  );

  const manager = m.contract("ScholarshipManagerV2", [
    usdc,
    studentNFT,
    donaterNFT,
  ]);

  const minterRole = keccak256(toHex("MINTER_ROLE"));

  m.call(donaterNFT, "grantRole", [minterRole, manager]);
  m.call(studentNFT, "grantRole", [minterRole, manager]);

  return { donaterNFT, studentNFT, manager };
});
