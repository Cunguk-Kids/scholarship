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

  const donate = (pid: bigint, amountStr: string, nftMetadataURI: string) => {
    writeContract({
      address: CORE_ADDRESS,
      abi: scholarshipCoreAbi,
      functionName: "donate",
      args: [pid, parseUnits(amountStr, 6), nftMetadataURI],
    });
  };

  return { donate, isPending, isSuccess, error, hash, reset };
}

export function useClaimYield() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const claimYield = (pid: bigint, voteAddress: `0x${string}`) => {
    writeContract({
      address: TREASURY_ADDRESS,
      abi: scholarshipTreasuryAbi,
      functionName: "claimYield",
      args: [pid, voteAddress],
    });
  };

  return { claimYield, isPending, isSuccess, error, hash, reset };
}

export function useClaimRefund() {
  const { writeContract, isPending, isSuccess, error, hash, reset } = useTxHook();

  const claimRefund = (pid: bigint, donor: `0x${string}`) => {
    writeContract({
      address: TREASURY_ADDRESS,
      abi: scholarshipTreasuryAbi,
      functionName: "claimRefund",
      args: [pid, donor],
    });
  };

  return { claimRefund, isPending, isSuccess, error, hash, reset };
}
