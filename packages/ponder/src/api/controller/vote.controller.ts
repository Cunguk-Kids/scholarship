import { Context } from "hono";
import { contractAddress, publicClient, walletClient } from "../constants/config";
import { scholarshipAbi } from "abis/abi";
import { VoterSchemaType } from "../validators/vote.validator";
import { db } from "@/db";
import { students, votes } from "@/db/schema";
import { eq } from "drizzle-orm";

export const voteController = async (c: Context) => {
  const body = await c.req.parseBody();
  const { programId, voter, applicantAddress } = body as unknown as VoterSchemaType;


  const [student] = await db
    .select()
    .from(students)
    .where(eq(students.studentAddress, applicantAddress));

  if (!student) {
    return c.json({
      message: `Student not found for address: ${applicantAddress}`
    });
  }

  const recipientWallet = await publicClient.simulateContract({
    address: contractAddress,
    abi: scholarshipAbi,
    functionName: 'voteApplicant',
    args: [BigInt(Number(programId)), voter as `0x${string}`, applicantAddress as `0x${string}`],
    account: walletClient.account
  });

  await db.insert(votes).values({
    address: String(voter),
    programId: Number(programId),
    studentId: student.studentId,
  }).onConflictDoNothing();

  return c.json({
    data: {
      programId, voter, applicantAddress, recipientWallet
    }
  });

};
