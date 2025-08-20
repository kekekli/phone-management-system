import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: '输入数据验证失败',
        message: error.details.map(detail => detail.message).join('; ')
      };
      res.status(400).json(response);
      return;
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: '查询参数验证失败',
        message: error.details.map(detail => detail.message).join('; ')
      };
      res.status(400).json(response);
      return;
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const response: ApiResponse = {
        success: false,
        error: '路径参数验证失败',
        message: error.details.map(detail => detail.message).join('; ')
      };
      res.status(400).json(response);
      return;
    }

    req.params = value;
    next();
  };
};