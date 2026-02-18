// Result pattern interface matching the backend
export interface Result<T = any> {
  isSuccess: boolean;
  error?: ResultError;
  data?: T;
}

export interface ResultError {
  message: string;
  code: string;
}

// Helper to check if response is a Result pattern
export function isResultPattern(response: any): response is Result {
  return response && typeof response.isSuccess === 'boolean';
}

// Helper to extract error message from any response
export function extractErrorMessage(error: any): string | null {
  if (!error) return null;
  
  const errorData = error.error || error;
  
  // Check for Result pattern
  if (isResultPattern(errorData) && !errorData.isSuccess && errorData.error) {
    return errorData.error.message;
  }
  
  // Check for Error object with message
  if (errorData.message) {
    return errorData.message;
  }
  
  // Check for Error object with Message (PascalCase)
  if (errorData.Message) {
    return errorData.Message;
  }
  
  // Check for array of errors (ModelState)
  if (Array.isArray(errorData) && errorData.length > 0) {
    return typeof errorData[0] === 'string' ? errorData[0] : errorData[0]?.errorMessage || errorData[0]?.message;
  }
  
  // Check for errors object (validation)
  if (errorData.errors && typeof errorData.errors === 'object') {
    const keys = Object.keys(errorData.errors);
    if (keys.length > 0) {
      const firstError = errorData.errors[keys[0]];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return firstError[0];
      }
    }
  }
  
  // Check for simple string
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  return null;
}
