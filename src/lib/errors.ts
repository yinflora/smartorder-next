// API error base class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Network error
export class NetworkError extends Error {
  constructor(message = '網路連線失敗，請檢查網路狀態') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Validation error
export class ValidationError extends ApiError {
  constructor(
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

// Not found error
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} 不存在`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

// Get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) return error.message;
  if (isApiError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return '發生未知錯誤';
}
