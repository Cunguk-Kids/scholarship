import { Context } from "hono";
import os from 'os';
import { execSync } from "child_process";
import checkDiskSpace from "check-disk-space";

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
    status: 'ok',
  });
};
