// Result pattern interface matching the backend
export interface Result<T = any> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  error?: ResultError;
  meta?: Meta;
  timestamp: string;
}

export interface ResultError {
  code: string;
  message: string;
  details?: { [key: string]: string[] };
}

export interface Meta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  sortBy?: string;
  sortOrder?: string;
}

// Helper to check if response is a Result pattern
export function isResultPattern(response: any): response is Result {
  return response && typeof response.success === 'boolean';
}

// Helper to extract error message from any response
export function extractErrorMessage(error: any): string | null {
  if (!error) return null;
  
  const errorData = error.error || error;
  
  // Check for new Result pattern
  if (isResultPattern(errorData) && !errorData.success && errorData.error) {
    return errorData.error.message;
  }
  
  // Legacy or other error structures
  if (errorData.message) {
    return errorData.message;
  }
  
  if (errorData.Message) {
    return errorData.Message;
  }
  
  if (Array.isArray(errorData) && errorData.length > 0) {
    return typeof errorData[0] === 'string' ? errorData[0] : errorData[0]?.errorMessage || errorData[0]?.message;
  }
  
  if (errorData.errors && typeof errorData.errors === 'object') {
    const keys = Object.keys(errorData.errors);
    if (keys.length > 0) {
      const firstError = errorData.errors[keys[0]];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }
  
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  return null;
}
