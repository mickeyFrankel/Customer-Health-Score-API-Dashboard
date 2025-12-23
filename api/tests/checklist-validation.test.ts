import { describe, expect, test } from 'vitest';

import {
  createChecklistSchema,
  updateChecklistSchema,
  listChecklistsQuerySchema,
  checklistIdSchema,
} from '../src/schemas/checklist.schema';

describe('Checklist Validation Schemas', () => {
  describe('createChecklistSchema', () => {
    test('validates valid checklist data', () => {
      const validData = {
        customerId: 'customer-123',
        score: 85,
        notes: 'Customer is doing well',
      };

      const result = createChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('accepts checklist without notes', () => {
      const validData = {
        customerId: 'customer-123',
        score: 85,
      };

      const result = createChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('accepts null notes', () => {
      const validData = {
        customerId: 'customer-123',
        score: 85,
        notes: null,
      };

      const result = createChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects missing customerId', () => {
      const invalidData = {
        score: 85,
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects empty customerId', () => {
      const invalidData = {
        customerId: '',
        score: 85,
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects missing score', () => {
      const invalidData = {
        customerId: 'customer-123',
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects score below 0', () => {
      const invalidData = {
        customerId: 'customer-123',
        score: -1,
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects score above 100', () => {
      const invalidData = {
        customerId: 'customer-123',
        score: 101,
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects non-integer score', () => {
      const invalidData = {
        customerId: 'customer-123',
        score: 85.5,
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('rejects notes longer than 1000 characters', () => {
      const invalidData = {
        customerId: 'customer-123',
        score: 85,
        notes: 'a'.repeat(1001),
      };

      const result = createChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('accepts score of 0', () => {
      const validData = {
        customerId: 'customer-123',
        score: 0,
      };

      const result = createChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('accepts score of 100', () => {
      const validData = {
        customerId: 'customer-123',
        score: 100,
      };

      const result = createChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('updateChecklistSchema', () => {
    test('validates partial update with all fields', () => {
      const validData = {
        customerId: 'customer-456',
        score: 90,
        notes: 'Updated notes',
      };

      const result = updateChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('validates partial update with single field', () => {
      const validData = {
        score: 75,
      };

      const result = updateChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('validates empty update object', () => {
      const validData = {};

      const result = updateChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('rejects invalid score in update', () => {
      const invalidData = {
        score: 150,
      };

      const result = updateChecklistSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    test('accepts null notes in update', () => {
      const validData = {
        notes: null,
      };

      const result = updateChecklistSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('listChecklistsQuerySchema', () => {
    test('validates query with all parameters', () => {
      const validQuery = {
        customerId: 'customer-123',
        minScore: '50',
        maxScore: '90',
        limit: '20',
        offset: '10',
        sortBy: 'score',
        sortOrder: 'asc',
      };

      const result = listChecklistsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.minScore).toBe(50);
        expect(result.data.maxScore).toBe(90);
        expect(result.data.limit).toBe(20);
        expect(result.data.offset).toBe(10);
      }
    });

    test('applies default values', () => {
      const validQuery = {};

      const result = listChecklistsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(10);
        expect(result.data.offset).toBe(0);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.sortOrder).toBe('desc');
      }
    });

    test('validates customerId filter', () => {
      const validQuery = {
        customerId: 'customer-789',
      };

      const result = listChecklistsQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    test('rejects invalid sortBy value', () => {
      const invalidQuery = {
        sortBy: 'invalid',
      };

      const result = listChecklistsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    test('rejects invalid sortOrder value', () => {
      const invalidQuery = {
        sortOrder: 'invalid',
      };

      const result = listChecklistsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    test('rejects limit above 100', () => {
      const invalidQuery = {
        limit: '101',
      };

      const result = listChecklistsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });

    test('rejects negative offset', () => {
      const invalidQuery = {
        offset: '-1',
      };

      const result = listChecklistsQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe('checklistIdSchema', () => {
    test('validates valid checklist ID', () => {
      const validParams = {
        id: 'checklist-123',
      };

      const result = checklistIdSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    test('rejects empty ID', () => {
      const invalidParams = {
        id: '',
      };

      const result = checklistIdSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });

    test('rejects missing ID', () => {
      const invalidParams = {};

      const result = checklistIdSchema.safeParse(invalidParams);
      expect(result.success).toBe(false);
    });
  });
});
