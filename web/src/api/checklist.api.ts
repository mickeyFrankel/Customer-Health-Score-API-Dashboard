import { apiClient } from './client';
import type {
  Checklist,
  CreateChecklistInput,
  UpdateChecklistInput,
  ListChecklistsParams,
  ApiResponse,
  PaginatedResponse,
  CustomerStats,
} from '../types/api.types';

/**
 * Checklist API service
 * Provides type-safe methods for all checklist operations
 */
export class ChecklistApi {
  private readonly basePath = '/checklists';

  /**
   * Create a new checklist
   */
  async create(data: CreateChecklistInput): Promise<Checklist> {
    const response = await apiClient.post<ApiResponse<Checklist>>(
      this.basePath,
      data,
    );
    return response.data;
  }

  /**
   * List checklists with optional filtering, sorting, and pagination
   */
  async list(params?: ListChecklistsParams): Promise<PaginatedResponse<Checklist>> {
    return apiClient.get<PaginatedResponse<Checklist>>(
      this.basePath,
      params as Record<string, string | number | boolean | undefined>,
    );
  }

  /**
   * Get a single checklist by ID
   */
  async getById(id: string): Promise<Checklist> {
    const response = await apiClient.get<ApiResponse<Checklist>>(
      `${this.basePath}/${id}`,
    );
    return response.data;
  }

  /**
   * Update an existing checklist
   */
  async update(id: string, data: UpdateChecklistInput): Promise<Checklist> {
    const response = await apiClient.put<ApiResponse<Checklist>>(
      `${this.basePath}/${id}`,
      data,
    );
    return response.data;
  }

  /**
   * Delete a checklist
   */
  async delete(id: string): Promise<Checklist> {
    const response = await apiClient.delete<ApiResponse<Checklist>>(
      `${this.basePath}/${id}`,
    );
    return response.data;
  }

  /**
   * Get aggregated statistics for a customer
   */
  async getCustomerStats(customerId: string): Promise<CustomerStats> {
    const response = await apiClient.get<ApiResponse<CustomerStats>>(
      `${this.basePath}/customer/${customerId}/stats`,
    );
    return response.data;
  }
}

// Export singleton instance
export const checklistApi = new ChecklistApi();
