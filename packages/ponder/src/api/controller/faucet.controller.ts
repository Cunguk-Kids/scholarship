import { Context } from "hono";
import { db } from "@/db";
import { faucetData, programs, students, votes } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";
import { getClientIP } from "@/utils/getClientIP";
import { faucetSchemaType } from "../validators/faucet.validation";
import { contractAddress, walletClient } from "../constants/config";
import { scholarshipAbi } from "abis/abi";
import { parseEther } from "viem";

export const faucetController = async (c: Context) => {
  const body = await c.req.parseBody();
  const { address } = body as unknown as faucetSchemaType;

  let ipAddress = getClientIP(c);

  const req = c.req.raw as Request & { socket?: any };
  const socket = req?.socket;
  if (socket?.remoteAddress) ipAddress = socket.remoteAddress;

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const [faucet] = await db
    .select()
    .from(faucetData)
    .where(
      and(eq(faucetData.address, address), eq(faucetData.ipAddress, ipAddress))
    );

  if (faucet) {
    if (faucet?.updatedAt && faucet?.updatedAt < oneDayAgo) {
      return c.json(
        {
          message: "you can only claim once every 24 hours",
          nextClaimAt: new Date(
            faucet.updatedAt.getTime() + 24 * 60 * 60 * 1000
          ),
        },
        400
      );
    }
  }

  await db
    .insert(faucetData)
    .values({
      address: String(address),
      ipAddress: ipAddress || "",
    })
    .onConflictDoUpdate({
      target: [faucetData.address, faucetData.ipAddress],
      set: {
        address,
        ipAddress,
        updatedAt: new Date(),
      },
    });

  const txHash = await walletClient.sendTransaction({
    account: contractAddress,
    to: address as `0x0`,
    value: parseEther("0.01"),
  });

  return c.json({
    data: {
      address,
      txHash,
    },
  });
};
