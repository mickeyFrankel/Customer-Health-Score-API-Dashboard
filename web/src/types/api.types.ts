/**
 * Customer Health Checklist data model
 * Matches the backend Prisma schema exactly
 */
export interface Checklist {
  id: string;
  customerId: string;
  score: number;
  notes: string | null;
  createdAt: string; // ISO 8601 date string from API
  updatedAt: string; // ISO 8601 date string from API
}

/**
 * Data required to create a new checklist
 */
export interface CreateChecklistInput {
  customerId: string;
  score: number;
  notes?: string | null;
}

/**
 * Data for updating an existing checklist
 * All fields are optional (partial update)
 */
export interface UpdateChecklistInput {
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

/**
 * Pagination metadata returned with list responses
 */
export interface PaginationMetadata {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Standard API response wrapper for single resources
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Standard API response wrapper for collections
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Customer statistics aggregated data
 */
export interface CustomerStats {
  totalChecklists: number;
  averageScore: number;
  latestScore: number | null;
  scoreHistory: Array<{
    date: string; // ISO 8601 date string
    score: number;
  }>;
}

/**
 * Error response from API
 */
export interface ApiError {
  error: string;
  message: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

/**
 * HTTP methods supported by the API client
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Request options for API client
 */
export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}
