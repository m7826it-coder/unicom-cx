export class ApiError extends Error {
  statusCode: number;
  type: string;
  title: string;
  detail: string;
  instance: string;
  errors?: { field: string; message: string }[];

  constructor(
    statusCode: number,
    type: string,
    title: string,
    detail: string,
    instance: string,
    errors?: { field: string; message: string }[]
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
}

export type SuccessResponse<T> = {
  success: true;
  data: T;
  pagination?: PaginationMeta;
};

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}