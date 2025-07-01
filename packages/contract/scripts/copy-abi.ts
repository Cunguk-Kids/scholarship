const data = await Bun.file(
  import.meta.dirname +
    "/../artifacts/contracts/ScholarshipManager.sol/ScholarshipManager.json"
).json();

const abi = Bun.inspect(data.abi, { depth: Infinity });
Bun.write(
  import.meta.dirname + "/../../frontend/src/repo/abi.ts",
  `export const scholarshipAbi = ${abi} as const`
);
