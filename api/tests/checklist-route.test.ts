import request from 'supertest';
import {
  describe,
  expect,
  test,
  vi,
  beforeEach,
  afterAll,
  beforeAll,
} from 'vitest';
import type { CustomerHealthChecklist } from '@prisma/client';

import { createApp } from '../src/app';
import { prisma } from '../src/lib/prisma';
import { NotFoundError, DatabaseError } from '../src/errors/app-errors';

// Mock Prisma client
vi.mock('../src/lib/prisma', () => ({
  prisma: {
    customerHealthChecklist: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
    $disconnect: vi.fn(),
  },
}));

describe('Checklist Routes', () => {
  const app = createApp();

  const mockChecklist: CustomerHealthChecklist = {
    id: 'checklist-123',
    customerId: 'customer-456',
    score: 85,
    notes: 'Customer is doing well',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeAll(() => {
    // Mock health check
    vi.mocked(prisma.$queryRawUnsafe).mockResolvedValue(1);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(async () => {
    vi.restoreAllMocks();
    await prisma.$disconnect();
  });

  describe('POST /api/checklists', () => {
    test('creates a new checklist successfully', async () => {
      vi.mocked(prisma.customerHealthChecklist.create).mockResolvedValue(
        mockChecklist,
      );

      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: 85,
          notes: 'Customer is doing well',
        })
        .expect(201);

      expect(response.body.data).toEqual({
        ...mockChecklist,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
      expect(response.body.message).toBe('Checklist created successfully');
    });

    test('creates checklist without notes', async () => {
      const checklistWithoutNotes = { ...mockChecklist, notes: null };
      vi.mocked(prisma.customerHealthChecklist.create).mockResolvedValue(
        checklistWithoutNotes,
      );

      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: 85,
        })
        .expect(201);

      expect(response.body.data.notes).toBeNull();
    });

    test('returns 400 for missing customerId', async () => {
      const response = await request(app)
        .post('/api/checklists')
        .send({
          score: 85,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    test('returns 400 for missing score', async () => {
      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('returns 400 for score below 0', async () => {
      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: -1,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('returns 400 for score above 100', async () => {
      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: 101,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });

    test('returns 400 for non-integer score', async () => {
      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: 85.5,
        })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/checklists', () => {
    const mockChecklists = [
      mockChecklist,
      { ...mockChecklist, id: 'checklist-124', score: 75 },
      { ...mockChecklist, id: 'checklist-125', score: 90 },
    ];

    test('lists all checklists with default pagination', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockChecklists,
      );
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(3);

      const response = await request(app).get('/api/checklists').expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination).toEqual({
        total: 3,
        limit: 10,
        offset: 0,
        hasMore: false,
      });
    });

    test('filters by customerId', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklist,
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/checklists')
        .query({ customerId: 'customer-456' })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { customerId: 'customer-456' },
        }),
      );
    });

    test('filters by score range', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklists[1],
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/checklists')
        .query({ minScore: 70, maxScore: 80 })
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { score: { gte: 70, lte: 80 } },
        }),
      );
    });

    test('applies pagination parameters', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklists[0],
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(25);

      const response = await request(app)
        .get('/api/checklists')
        .query({ limit: 10, offset: 10 })
        .expect(200);

      expect(response.body.pagination).toEqual({
        total: 25,
        limit: 10,
        offset: 10,
        hasMore: true,
      });
    });

    test('applies sorting parameters', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockChecklists,
      );
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(3);

      await request(app)
        .get('/api/checklists')
        .query({ sortBy: 'score', sortOrder: 'asc' })
        .expect(200);

      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { score: 'asc' },
        }),
      );
    });

    test('returns 400 for invalid query parameters', async () => {
      const response = await request(app)
        .get('/api/checklists')
        .query({ sortBy: 'invalid' })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/checklists/:id', () => {
    test('retrieves a checklist by ID', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );

      const response = await request(app)
        .get('/api/checklists/checklist-123')
        .expect(200);

      expect(response.body.data).toEqual({
        ...mockChecklist,
        createdAt: '2024-01-15T10:00:00.000Z',
        updatedAt: '2024-01-15T10:00:00.000Z',
      });
    });

    test('returns 404 when checklist not found', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .get('/api/checklists/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('NOT_FOUND');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/checklists/:id', () => {
    test('updates a checklist successfully', async () => {
      const updatedChecklist = {
        ...mockChecklist,
        score: 95,
        notes: 'Improved significantly',
      };

      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockResolvedValue(
        updatedChecklist,
      );

      const response = await request(app)
        .put('/api/checklists/checklist-123')
        .send({
          score: 95,
          notes: 'Improved significantly',
        })
        .expect(200);

      expect(response.body.data.score).toBe(95);
      expect(response.body.data.notes).toBe('Improved significantly');
      expect(response.body.message).toBe('Checklist updated successfully');
    });

    test('updates single field', async () => {
      const updatedChecklist = { ...mockChecklist, score: 95 };

      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockResolvedValue(
        updatedChecklist,
      );

      const response = await request(app)
        .put('/api/checklists/checklist-123')
        .send({ score: 95 })
        .expect(200);

      expect(response.body.data.score).toBe(95);
    });

    test('returns 404 when updating non-existent checklist', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .put('/api/checklists/non-existent-id')
        .send({ score: 95 })
        .expect(404);

      expect(response.body.error).toBe('NOT_FOUND');
    });

    test('returns 400 for invalid update data', async () => {
      const response = await request(app)
        .put('/api/checklists/checklist-123')
        .send({ score: 150 })
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('DELETE /api/checklists/:id', () => {
    test('deletes a checklist successfully', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.delete).mockResolvedValue(
        mockChecklist,
      );

      const response = await request(app)
        .delete('/api/checklists/checklist-123')
        .expect(200);

      expect(response.body.message).toBe('Checklist deleted successfully');
      expect(response.body.data).toBeDefined();
    });

    test('returns 404 when deleting non-existent checklist', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .delete('/api/checklists/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/checklists/customer/:customerId/stats', () => {
    test('retrieves customer statistics', async () => {
      const mockStats = [
        { score: 90, createdAt: new Date('2024-01-15') },
        { score: 80, createdAt: new Date('2024-01-10') },
        { score: 70, createdAt: new Date('2024-01-05') },
      ];

      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockStats,
      );

      const response = await request(app)
        .get('/api/checklists/customer/customer-456/stats')
        .expect(200);

      expect(response.body.data.totalChecklists).toBe(3);
      expect(response.body.data.averageScore).toBe(80);
      expect(response.body.data.latestScore).toBe(90);
      expect(response.body.data.scoreHistory).toHaveLength(3);
    });

    test('handles customer with no checklists', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/checklists/customer/customer-789/stats')
        .expect(200);

      expect(response.body.data.totalChecklists).toBe(0);
      expect(response.body.data.averageScore).toBe(0);
      expect(response.body.data.latestScore).toBeNull();
    });
  });

  describe('Error Handling', () => {
    test('handles database errors gracefully', async () => {
      vi.mocked(prisma.customerHealthChecklist.create).mockRejectedValue(
        new Error('Database connection failed'),
      );

      const response = await request(app)
        .post('/api/checklists')
        .send({
          customerId: 'customer-456',
          score: 85,
        })
        .expect(500);

      expect(response.body.error).toBe('DATABASE_ERROR');
    });

    test('returns 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Not Found');
    });
  });
});
