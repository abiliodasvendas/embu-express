export interface ApiError extends Error {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
    status?: number;
  };
}
