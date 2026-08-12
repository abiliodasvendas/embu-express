export interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
