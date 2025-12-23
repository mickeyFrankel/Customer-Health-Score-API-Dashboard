import os from 'node:os';

import { checkDatabaseHealth } from '../lib/prisma';

export interface HealthSummary {
  status: 'ok' | 'degraded';
  uptimeSeconds: number;
  region: string;
  dbStatus: 'ok' | 'degraded';
}

export async function getHealthSummary(): Promise<HealthSummary> {
  const [dbStatus] = await Promise.all([checkDatabaseHealth()]);
  const uptimeSeconds = Math.round(process.uptime());
  const region = process.env.DEPLOYMENT_REGION ?? os.hostname();

  const summary: HealthSummary = {
    status: dbStatus === 'ok' ? 'ok' : 'degraded',
    uptimeSeconds,
    region,
    dbStatus,
  };

  return summary;
}
