import { Context } from "hono";
import os from 'os';
import { execSync } from "child_process";
import checkDiskSpace from "check-disk-space";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { logger } from "@/utils/logger";
import { sendSseToAll } from "./sse.controller";
import { geminiService } from "../service/gemini.service";

export const serverHealthController = async (c: Context) => {
  const cpuLoad = os.loadavg();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  let disk = null;
  try {
    disk = await checkDiskSpace('/');
  } catch (e) {
    disk = { error: 'Failed to read disk info' };
  }

  const portsToCheck = [8080, 42069];
  const portStatus: Record<number, boolean> = {};

  for (const port of portsToCheck) {
    try {
      const result = execSync(`lsof -i :${port} | grep LISTEN`, {
        stdio: ['pipe', 'pipe', 'ignore'],
      }).toString();
      portStatus[port] = result.trim().length > 0;
    } catch {
      portStatus[port] = false;
    }
  }

  let dbStatus = 'unknown';
  try {
    await db.execute(sql`SELECT 1`);
    dbStatus = 'connected';
  } catch (e) {
    logger.error({ e }, "database error");
    dbStatus = 'error';
  }

  await sendSseToAll('main', {
    step: 'Health', data: {
      cpuLoadAvg: {
        '1min': cpuLoad[0],
        '5min': cpuLoad[1],
        '15min': cpuLoad[2],
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usedPercent: +(usedMem / totalMem * 100).toFixed(2),
      },
      disk,
      portStatus,
      database: dbStatus,
      status: 'ok',
    }, status: true
  });

  const geminiResponse = await geminiService(JSON.stringify({
    cpuLoadAvg: {
      '1min': cpuLoad[0],
      '5min': cpuLoad[1],
      '15min': cpuLoad[2],
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPercent: +(usedMem / totalMem * 100).toFixed(2),
    },
    disk,
    portStatus,
    database: dbStatus,
    status: 'ok',
  }));

  return c.json({
    cpuLoadAvg: {
      '1min': cpuLoad[0],
      '5min': cpuLoad[1],
      '15min': cpuLoad[2],
    },
    memory: {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPercent: +(usedMem / totalMem * 100).toFixed(2),
    },
    disk,
    portStatus,
    database: dbStatus,
    status: 'ok',
    geminiResponse: geminiResponse
  });

};