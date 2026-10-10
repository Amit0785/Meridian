export function formatResponse<T = any>(data: T, message = 'Success', statusCode = 200) {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
}

export function formatError(message: string, statusCode = 400, details?: any) {
  return {
    success: false,
    statusCode,
    message,
    error: {
      code: 'BAD_REQUEST',
      details,
    },
  };
}

export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// Function object namespace for backwards compatibility (no class)
export const CommonService = {
  formatResponse,
  formatError,
  generateId,
};
