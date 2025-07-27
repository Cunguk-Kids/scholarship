const dataManager = await Bun.file(
  import.meta.dirname +
  "/../artifacts/contracts/ScholarshipManager.sol/ScholarshipManager.json"
).json();

const dataProgram = await Bun.file(
  import.meta.dirname +
  "/../artifacts/contracts/ScholarshipProgram.sol/ScholarshipProgram.json"
).json();

const abi = Bun.inspect(dataManager.abi, { depth: Infinity });
const abi2 = Bun.inspect(dataProgram.abi, { depth: Infinity });

Bun.write(
  import.meta.dirname + "/../../frontend/src/repo/abi.ts",
  `export const scholarshipAbi = ${abi} as const` +
  "\n" +
  `export const scholarshipProgramAbi = ${abi2} as const`
);
Bun.write(
  import.meta.dirname + "/../../ponder/abis/abi.ts",
  `export const scholarshipAbi = ${abi} as const` +
  "\n" +
  `export const scholarshipProgramAbi = ${abi2} as const`
);
