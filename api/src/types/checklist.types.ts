import type { CustomerHealthChecklist } from '@prisma/client';

/**
 * Standard API response wrapper for single resources
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Standard API response wrapper for collections with pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * Customer Health Checklist as returned by the API
 * (matches the Prisma model exactly)
 */
export type ChecklistResponse = CustomerHealthChecklist;

/**
 * Checklist data for creation (without auto-generated fields)
 */
export interface CreateChecklistData {
  customerId: string;
  score: number;
  notes?: string | null;
}

/**
 * Checklist data for updates (all fields optional)
 */
export interface UpdateChecklistData {
  customerId?: string;
  score?: number;
  notes?: string | null;
}

/**
 * Query parameters for filtering and pagination
 */
export interface ListChecklistsParams {
  customerId?: string;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'score';
  sortOrder?: 'asc' | 'desc';
}
