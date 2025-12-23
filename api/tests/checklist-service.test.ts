import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import type { CustomerHealthChecklist } from '@prisma/client';

import { ChecklistService } from '../src/services/checklist-service';
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
  },
}));

describe('ChecklistService', () => {
  let service: ChecklistService;

  beforeEach(() => {
    service = new ChecklistService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockChecklist: CustomerHealthChecklist = {
    id: 'checklist-123',
    customerId: 'customer-456',
    score: 85,
    notes: 'Customer is doing well',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  describe('createChecklist', () => {
    test('creates a new checklist successfully', async () => {
      const createData = {
        customerId: 'customer-456',
        score: 85,
        notes: 'Customer is doing well',
      };

      vi.mocked(prisma.customerHealthChecklist.create).mockResolvedValue(
        mockChecklist,
      );

      const result = await service.createChecklist(createData);

      expect(result).toEqual(mockChecklist);
      expect(prisma.customerHealthChecklist.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer-456',
          score: 85,
          notes: 'Customer is doing well',
        },
      });
    });

    test('creates checklist with null notes', async () => {
      const createData = {
        customerId: 'customer-456',
        score: 85,
      };

      const checklistWithoutNotes = { ...mockChecklist, notes: null };
      vi.mocked(prisma.customerHealthChecklist.create).mockResolvedValue(
        checklistWithoutNotes,
      );

      const result = await service.createChecklist(createData);

      expect(result.notes).toBeNull();
      expect(prisma.customerHealthChecklist.create).toHaveBeenCalledWith({
        data: {
          customerId: 'customer-456',
          score: 85,
          notes: null,
        },
      });
    });

    test('throws DatabaseError on creation failure', async () => {
      const createData = {
        customerId: 'customer-456',
        score: 85,
      };

      vi.mocked(prisma.customerHealthChecklist.create).mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.createChecklist(createData)).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('getChecklistById', () => {
    test('retrieves checklist by ID successfully', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );

      const result = await service.getChecklistById('checklist-123');

      expect(result).toEqual(mockChecklist);
      expect(prisma.customerHealthChecklist.findUnique).toHaveBeenCalledWith({
        where: { id: 'checklist-123' },
      });
    });

    test('throws NotFoundError when checklist does not exist', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.getChecklistById('non-existent-id'),
      ).rejects.toThrow(NotFoundError);
    });

    test('throws DatabaseError on query failure', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getChecklistById('checklist-123')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('listChecklists', () => {
    const mockChecklists = [
      mockChecklist,
      {
        ...mockChecklist,
        id: 'checklist-124',
        score: 75,
      },
      {
        ...mockChecklist,
        id: 'checklist-125',
        score: 90,
      },
    ];

    test('lists all checklists with default pagination', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockChecklists,
      );
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(3);

      const result = await service.listChecklists();

      expect(result.data).toEqual(mockChecklists);
      expect(result.pagination).toEqual({
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

      await service.listChecklists({ customerId: 'customer-456' });

      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith({
        where: { customerId: 'customer-456' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    test('filters by score range', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklists[1],
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(1);

      await service.listChecklists({ minScore: 70, maxScore: 80 });

      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith({
        where: { score: { gte: 70, lte: 80 } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });
    });

    test('applies pagination correctly', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklists[1],
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(25);

      const result = await service.listChecklists({ limit: 10, offset: 10 });

      expect(result.pagination).toEqual({
        total: 25,
        limit: 10,
        offset: 10,
        hasMore: true,
      });
    });

    test('sorts by score ascending', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockChecklists,
      );
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(3);

      await service.listChecklists({ sortBy: 'score', sortOrder: 'asc' });

      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { score: 'asc' },
        take: 10,
        skip: 0,
      });
    });

    test('combines multiple filters', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([
        mockChecklist,
      ]);
      vi.mocked(prisma.customerHealthChecklist.count).mockResolvedValue(1);

      await service.listChecklists({
        customerId: 'customer-456',
        minScore: 80,
        maxScore: 90,
        sortBy: 'updatedAt',
        sortOrder: 'asc',
      });

      expect(prisma.customerHealthChecklist.findMany).toHaveBeenCalledWith({
        where: {
          customerId: 'customer-456',
          score: { gte: 80, lte: 90 },
        },
        orderBy: { updatedAt: 'asc' },
        take: 10,
        skip: 0,
      });
    });

    test('throws DatabaseError on query failure', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.listChecklists()).rejects.toThrow(DatabaseError);
    });
  });

  describe('updateChecklist', () => {
    test('updates checklist successfully', async () => {
      const updateData = { score: 95, notes: 'Improved significantly' };
      const updatedChecklist = { ...mockChecklist, ...updateData };

      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockResolvedValue(
        updatedChecklist,
      );

      const result = await service.updateChecklist('checklist-123', updateData);

      expect(result).toEqual(updatedChecklist);
      expect(prisma.customerHealthChecklist.update).toHaveBeenCalledWith({
        where: { id: 'checklist-123' },
        data: { score: 95, notes: 'Improved significantly' },
      });
    });

    test('updates single field', async () => {
      const updateData = { score: 95 };
      const updatedChecklist = { ...mockChecklist, score: 95 };

      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockResolvedValue(
        updatedChecklist,
      );

      const result = await service.updateChecklist('checklist-123', updateData);

      expect(result.score).toBe(95);
      expect(prisma.customerHealthChecklist.update).toHaveBeenCalledWith({
        where: { id: 'checklist-123' },
        data: { score: 95 },
      });
    });

    test('updates notes to null', async () => {
      const updateData = { notes: null };
      const updatedChecklist = { ...mockChecklist, notes: null };

      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockResolvedValue(
        updatedChecklist,
      );

      const result = await service.updateChecklist('checklist-123', updateData);

      expect(result.notes).toBeNull();
    });

    test('throws NotFoundError when checklist does not exist', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.updateChecklist('non-existent-id', { score: 90 }),
      ).rejects.toThrow(NotFoundError);
    });

    test('throws DatabaseError on update failure', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.update).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.updateChecklist('checklist-123', { score: 90 }),
      ).rejects.toThrow(DatabaseError);
    });
  });

  describe('deleteChecklist', () => {
    test('deletes checklist successfully', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.delete).mockResolvedValue(
        mockChecklist,
      );

      const result = await service.deleteChecklist('checklist-123');

      expect(result).toEqual(mockChecklist);
      expect(prisma.customerHealthChecklist.delete).toHaveBeenCalledWith({
        where: { id: 'checklist-123' },
      });
    });

    test('throws NotFoundError when checklist does not exist', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.deleteChecklist('non-existent-id'),
      ).rejects.toThrow(NotFoundError);
    });

    test('throws DatabaseError on deletion failure', async () => {
      vi.mocked(prisma.customerHealthChecklist.findUnique).mockResolvedValue(
        mockChecklist,
      );
      vi.mocked(prisma.customerHealthChecklist.delete).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.deleteChecklist('checklist-123')).rejects.toThrow(
        DatabaseError,
      );
    });
  });

  describe('getCustomerStats', () => {
    test('calculates statistics correctly', async () => {
      const mockChecklists = [
        { score: 90, createdAt: new Date('2024-01-15') },
        { score: 80, createdAt: new Date('2024-01-10') },
        { score: 70, createdAt: new Date('2024-01-05') },
      ];

      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue(
        mockChecklists,
      );

      const result = await service.getCustomerStats('customer-456');

      expect(result.totalChecklists).toBe(3);
      expect(result.averageScore).toBe(80);
      expect(result.latestScore).toBe(90);
      expect(result.scoreHistory).toHaveLength(3);
    });

    test('handles customer with no checklists', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockResolvedValue([]);

      const result = await service.getCustomerStats('customer-789');

      expect(result.totalChecklists).toBe(0);
      expect(result.averageScore).toBe(0);
      expect(result.latestScore).toBeNull();
      expect(result.scoreHistory).toHaveLength(0);
    });

    test('throws DatabaseError on query failure', async () => {
      vi.mocked(prisma.customerHealthChecklist.findMany).mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getCustomerStats('customer-456')).rejects.toThrow(
        DatabaseError,
      );
    });
  });
});
