import { Context } from "hono";
import { contractAddress, walletClient } from "../constants/config";
import { scholarshipAbi } from "abis/abi";
import { VoterSchemaType } from "../validators/vote.validator";
import { db } from "@/db";
import { programs, students, votes } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getClientIP } from "@/utils/getClientIP";

export const voteController = async (c: Context) => {
  const body = await c.req.parseBody();
  const { programId, voter, applicantAddress } = body as unknown as VoterSchemaType;

  let ipAddress = getClientIP(c);

  const req = c.req.raw as Request & { socket?: any; };
  const socket = req?.socket;
  if (socket?.remoteAddress) ipAddress = socket.remoteAddress;

  const [program] = await db
    .select()
    .from(programs)
    .where(and(
      eq(programs.blockchainId, programId),
    ));

  if (!program) {
    return c.json({
      message: `Program not found for address: ${applicantAddress} , and blockchain program Id: ${programId}`
    });
  }

  const [student] = await db
    .select()
    .from(students)
    .where(and(
      eq(students.studentAddress, applicantAddress),
      eq(students.programId, program.id),
    ));

  if (!student) {
    return c.json({
      message: `Student not found for address: ${applicantAddress}, program id: program.id`
    });
  }

  const recipientWallet = await walletClient.writeContract({
    address: contractAddress,
    abi: scholarshipAbi,
    functionName: 'voteApplicant',
    args: [BigInt(programId), voter as `0x${string}`, applicantAddress as `0x${string}`],
    account: walletClient.account
  });

  await db.insert(votes).values({
    address: String(voter),
    programId: student.programId,
    studentId: student.id,
    blockchainProgramId: Number(programId),
    blockchainStudentId: Number(student.blockchainId),
    ipAddress: ipAddress || ''
  }).onConflictDoNothing();

  return c.json({
    data: {
      programId, voter, applicantAddress, recipientWallet
    }
  });

};
