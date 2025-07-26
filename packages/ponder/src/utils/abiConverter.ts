import fs from "fs";
import path from "path";
import abi from "../../abis/abiSC.json";

type AbiEntry = {
  type: string;
  name?: string;
  inputs?: { name: string; type: string; }[];
  outputs?: { name?: string; type: string; }[];
  stateMutability?: string;
};

function convertAbiJsonToTsObjectArray(abiJson: any[]): AbiEntry[] {
  return abiJson.map((entry) => ({
    type: entry.type,
    name: entry.name ?? "",
    inputs: entry.inputs?.map((input: any) => ({
      name: input.name,
      type: input.type,
    })) ?? [],
    outputs: entry.outputs?.map((output: any) => ({
      name: output.name ?? "",
      type: output.type,
    })) ?? [],
    stateMutability: entry.stateMutability ?? "",
  }));
}

function writeAbiToFileSync(abiJson: any[], outputPath: string) {
  const converted = convertAbiJsonToTsObjectArray(abiJson);

  const fileContent = `export const abi = ${JSON.stringify(converted, null, 2)};\n`;

  fs.writeFileSync(path.resolve(outputPath), fileContent, "utf-8");
}


writeAbiToFileSync(abi, './abi.ts');