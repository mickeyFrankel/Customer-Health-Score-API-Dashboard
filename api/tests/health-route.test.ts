import request from 'supertest';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { prisma } from '../src/lib/prisma';
import { createApp } from '../src/app';

describe('GET /health', () => {
  beforeAll(() => {
    vi.spyOn(prisma, '$queryRawUnsafe').mockResolvedValue(1);
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await prisma.$disconnect();
  });

  test('returns service metadata', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(typeof response.body.uptimeSeconds).toBe('number');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('region');
    expect(response.body.dbStatus).toBe('ok');
  });
});
