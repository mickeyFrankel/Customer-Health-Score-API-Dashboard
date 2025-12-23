import type { CustomerHealthChecklist, Prisma } from '@prisma/client';

import { prisma } from '../lib/prisma';
import { NotFoundError, DatabaseError } from '../errors/app-errors';
import type {
  CreateChecklistData,
  UpdateChecklistData,
  ListChecklistsParams,
  PaginatedResponse,
} from '../types/checklist.types';

/**
 * Service layer for Customer Health Checklist operations
 * Handles business logic and database interactions
 */
export class ChecklistService {
  /**
   * Create a new customer health checklist
   */
  async createChecklist(
    data: CreateChecklistData,
  ): Promise<CustomerHealthChecklist> {
    try {
      const checklist = await prisma.customerHealthChecklist.create({
        data: {
          customerId: data.customerId,
          score: data.score,
          notes: data.notes ?? null,
        },
      });

      return checklist;
    } catch (error) {
      throw new DatabaseError('Failed to create checklist', error);
    }
  }

  /**
   * Retrieve a single checklist by ID
   */
  async getChecklistById(id: string): Promise<CustomerHealthChecklist> {
    try {
      const checklist = await prisma.customerHealthChecklist.findUnique({
        where: { id },
      });

      if (!checklist) {
        throw new NotFoundError('Checklist', id);
      }

      return checklist;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to retrieve checklist', error);
    }
  }

  /**
   * List checklists with optional filtering, sorting, and pagination
   */
  async listChecklists(
    params: ListChecklistsParams = {},
  ): Promise<PaginatedResponse<CustomerHealthChecklist>> {
    const {
      customerId,
      minScore,
      maxScore,
      limit = 10,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    try {
      // Build where clause for filtering
      const where: Prisma.CustomerHealthChecklistWhereInput = {};

      if (customerId) {
        where.customerId = customerId;
      }

      if (minScore !== undefined || maxScore !== undefined) {
        where.score = {};
        if (minScore !== undefined) {
          where.score.gte = minScore;
        }
        if (maxScore !== undefined) {
          where.score.lte = maxScore;
        }
      }

      // Build orderBy clause
      const orderBy: Prisma.CustomerHealthChecklistOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Execute query with pagination
      const [checklists, total] = await Promise.all([
        prisma.customerHealthChecklist.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        }),
        prisma.customerHealthChecklist.count({ where }),
      ]);

      return {
        data: checklists,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      throw new DatabaseError('Failed to list checklists', error);
    }
  }

  /**
   * Update an existing checklist
   * Supports partial updates - only provided fields will be updated
   */
  async updateChecklist(
    id: string,
    data: UpdateChecklistData,
  ): Promise<CustomerHealthChecklist> {
    try {
      // First check if checklist exists
      await this.getChecklistById(id);

      // Prepare update data
      const updateData: Prisma.CustomerHealthChecklistUpdateInput = {};

      if (data.customerId !== undefined) {
        updateData.customerId = data.customerId;
      }
      if (data.score !== undefined) {
        updateData.score = data.score;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      // Perform update
      const updatedChecklist = await prisma.customerHealthChecklist.update({
        where: { id },
        data: updateData,
      });

      return updatedChecklist;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to update checklist', error);
    }
  }

  /**
   * Delete a checklist by ID
   */
  async deleteChecklist(id: string): Promise<CustomerHealthChecklist> {
    try {
      // First check if checklist exists
      await this.getChecklistById(id);

      // Perform deletion
      const deletedChecklist = await prisma.customerHealthChecklist.delete({
        where: { id },
      });

      return deletedChecklist;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError('Failed to delete checklist', error);
    }
  }

  /**
   * Get aggregated statistics for a customer
   * Useful for dashboard views
   */
  async getCustomerStats(customerId: string): Promise<{
    totalChecklists: number;
    averageScore: number;
    latestScore: number | null;
    scoreHistory: Array<{ date: Date; score: number }>;
  }> {
    try {
      const checklists = await prisma.customerHealthChecklist.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
        select: {
          score: true,
          createdAt: true,
        },
      });

      const totalChecklists = checklists.length;
      const averageScore =
        totalChecklists > 0
          ? checklists.reduce((sum, c) => sum + c.score, 0) / totalChecklists
          : 0;
      const latestScore = checklists.length > 0 ? checklists[0].score : null;

      const scoreHistory = checklists.map((c) => ({
        date: c.createdAt,
        score: c.score,
      }));

      return {
        totalChecklists,
        averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimals
        latestScore,
        scoreHistory,
      };
    } catch (error) {
      throw new DatabaseError('Failed to get customer statistics', error);
    }
  }
}

// Export singleton instance
export const checklistService = new ChecklistService();
