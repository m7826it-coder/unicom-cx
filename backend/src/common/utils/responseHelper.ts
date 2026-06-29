// src/common/utils/responseHelper.ts
import type { Response } from 'express';

/**
 * البيانات الوصفية للترقيم (Pagination).
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

/**
 * استجابة ناجحة عامة.
 */
export function success(res: Response, data: unknown, statusCode: number = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

/**
 * استجابة ناجحة مع بيانات مرقمة.
 */
export function paginated(res: Response, data: unknown, pagination: PaginationMeta): void {
  res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

/**
 * استجابة إنشاء مورد بنجاح (201 Created).
 */
export function created(res: Response, data: unknown): void {
  res.status(201).json({
    success: true,
    data,
  });
}

/**
 * استجابة بدون محتوى (204 No Content).
 */
export function noContent(res: Response): void {
  res.status(204).send();
}