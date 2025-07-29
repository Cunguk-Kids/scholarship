import { Context } from "hono";

export const getClientIP = (c: Context): string => {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded?.split(",")?.[0]?.trim() || '';
  }

  const remoteAddr = (c.req.raw as any)?.socket?.remoteAddress;
  if (remoteAddr) return remoteAddr;

  return "unknown";
};