import { scholarshipCoreAbi, scholarshipTreasuryAbi, mockUSDCAbi, v4Addresses } from "@/constants/contractsV4";
import { parseUnits } from "viem";
import { useTxHook } from "./use-tx-base";

const CORE_ADDRESS = v4Addresses.ScholarshipCore;
const TREASURY_ADDRESS = v4Addresses.ScholarshipTreasury;
const USDC_ADDRESS = v4Addresses.MockUSDC;

// ── USDC ──────────────────────────────────────────────────────────────────────

export function useApproveUSDC() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const approve = (spender: `0x${string}`, amountStr: string) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: mockUSDCAbi,
      functionName: "approve",
      args: [spender, parseUnits(amountStr, 6)],
    });
  };

  return { approve, isPending, isSuccess, error, hash, reset };
}

export function useMintUSDC() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const mint = (to: `0x${string}`, amountStr: string) => {
    writeContract({
      address: USDC_ADDRESS,
      abi: mockUSDCAbi,
      functionName: "mint",
      args: [to, parseUnits(amountStr, 6)],
    });
  };

  return { mint, isPending, isSuccess, error, hash, reset };
}

// ── ScholarshipTreasury — Financial Actions ──────────────────────────────────

export function useDonate() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const donate = (programId: bigint, amountStr: string, nftMetadataURI: string) => {
    writeContract({
      address: CORE_ADDRESS,
      abi: scholarshipCoreAbi,
      functionName: "donate",
      args: [programId, parseUnits(amountStr, 6), nftMetadataURI],
    });
  };

  return { donate, isPending, isSuccess, error, hash, reset };
}

export function useClaimYield() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const claimYield = (programId: bigint, voteAddress: `0x${string}`) => {
    writeContract({
      address: TREASURY_ADDRESS,
      abi: scholarshipTreasuryAbi,
      functionName: "claimYield",
      args: [programId, voteAddress],
    });
  };

  return { claimYield, isPending, isSuccess, error, hash, reset };
}

export function useClaimRefund() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const claimRefund = (programId: bigint, donor: `0x${string}`) => {
    writeContract({
      address: TREASURY_ADDRESS,
      abi: scholarshipTreasuryAbi,
      functionName: "claimRefund",
      args: [programId, donor],
    });
  };

  return { claimRefund, isPending, isSuccess, error, hash, reset };
}
