import type { ApiError, RequestOptions } from '../types/api.types';

/**
 * Custom error class for API errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Build query string from parameters
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';

  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Type-safe API client with error handling
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a typed HTTP request
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const { method = 'GET', body, params } = options;
    
    const url = `${this.baseUrl}${endpoint}${buildQueryString(params)}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiClientError(
            'Request failed',
            response.status,
          );
        }
        // For successful non-JSON responses, return empty object
        return {} as T;
      }

      // Parse JSON response
      const data = await response.json();

      // Handle error responses
      if (!response.ok) {
        const error = data as ApiError;
        throw new ApiClientError(
          error.message || 'Request failed',
          response.status,
          error.error,
          error.details,
        );
      }

      return data as T;
    } catch (error) {
      // Re-throw ApiClientError as-is
      if (error instanceof ApiClientError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new ApiClientError(
          'Network error - please check your connection',
          0,
          'NETWORK_ERROR',
        );
      }

      // Handle unexpected errors
      throw new ApiClientError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR',
      );
    }
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
