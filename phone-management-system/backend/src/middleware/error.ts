import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = '服务器内部错误';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  } else if (error.message.includes('UNIQUE constraint failed')) {
    statusCode = 409;
    message = '数据冲突：记录已存在';
  } else if (error.message.includes('FOREIGN KEY constraint failed')) {
    statusCode = 400;
    message = '数据关联错误：引用的记录不存在';
  }

  console.error('错误详情:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user
  });

  const response: ApiResponse = {
    success: false,
    error: message
  };

  if (process.env.NODE_ENV === 'development') {
    response.message = error.message;
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `路由 ${req.originalUrl} 不存在`
  };
  res.status(404).json(response);
};