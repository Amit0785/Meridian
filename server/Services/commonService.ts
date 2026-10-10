export class CommonService {
  static formatResponse<T = any>(data: T, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
    };
  }

  static formatError(message: string, statusCode = 400, details?: any) {
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

  static generateId(prefix = 'id'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
}
