// src/common/utils/ApiError.ts

/**
 * صنف خطأ موحد متوافق مع RFC 7807 (Problem Details).
 * يُستخدم لإرجاع أخطاء API منسقة عبر جميع الوحدات.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly title: string;
  public readonly detail: string;
  public readonly instance: string;
  public readonly errors?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    title: string,
    detail: string,
    instance: string = '',
    errors?: { field: string; message: string }[],
    type: string = 'about:blank'
  ) {
    super(detail);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.type = type;
    this.title = title;
    this.detail = detail;
    this.instance = instance;
    this.errors = errors;
  }

  /**
   * 400 Bad Request – طلب غير صحيح.
   */
  static badRequest(detail: string, errors?: { field: string; message: string }[]): ApiError {
    return new ApiError(400, 'Bad Request', detail, '', errors, 'https://api.unicomcx.com/errors/bad-request');
  }

  /**
   * 401 Unauthorized – يفتقر إلى مصادقة صالحة.
   */
  static unauthorized(detail: string = 'Authentication required'): ApiError {
    return new ApiError(401, 'Unauthorized', detail, '', undefined, 'https://api.unicomcx.com/errors/unauthorized');
  }

  /**
   * 403 Forbidden – صلاحيات غير كافية.
   */
  static forbidden(detail: string = 'Insufficient permissions'): ApiError {
    return new ApiError(403, 'Forbidden', detail, '', undefined, 'https://api.unicomcx.com/errors/forbidden');
  }

  /**
   * 404 Not Found – المورد غير موجود.
   */
  static notFound(detail: string = 'Resource not found'): ApiError {
    return new ApiError(404, 'Not Found', detail, '', undefined, 'https://api.unicomcx.com/errors/not-found');
  }

  /**
   * 409 Conflict – تعارض مع الحالة الحالية للمورد.
   */
  static conflict(detail: string = 'Resource already exists'): ApiError {
    return new ApiError(409, 'Conflict', detail, '', undefined, 'https://api.unicomcx.com/errors/conflict');
  }

  /**
   * 422 Unprocessable Entity – أخطاء تحقق من المدخلات.
   */
  static validation(errors: { field: string; message: string }[]): ApiError {
    return new ApiError(422, 'Validation Error', 'Invalid request data', '', errors, 'https://api.unicomcx.com/errors/validation-error');
  }

  /**
   * 500 Internal Server Error – خطأ داخلي.
   */
  static internal(detail: string = 'Internal server error'): ApiError {
    return new ApiError(500, 'Internal Server Error', detail, '', undefined, 'https://api.unicomcx.com/errors/internal-server-error');
  }

  /**
   * إرجاع تمثيل JSON متوافق مع RFC 7807.
   */
  toJSON(): Record<string, unknown> {
    const body: Record<string, unknown> = {
      type: this.type,
      title: this.title,
      status: this.statusCode,
      detail: this.detail,
      instance: this.instance,
    };
    if (this.errors && this.errors.length > 0) {
      body.errors = this.errors;
    }
    return body;
  }
}