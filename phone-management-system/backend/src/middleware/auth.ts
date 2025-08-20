import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiResponse } from '../types';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: '缺少访问令牌'
    };
    res.status(401).json(response);
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    const response: ApiResponse = {
      success: false,
      error: '无效或过期的令牌'
    };
    res.status(403).json(response);
    return;
  }

  req.user = payload;
  next();
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: '未授权访问'
      };
      res.status(401).json(response);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const response: ApiResponse = {
        success: false,
        error: '权限不足'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};