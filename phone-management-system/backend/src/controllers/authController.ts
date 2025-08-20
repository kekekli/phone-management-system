import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse, LoginRequest, AuthResponse } from '../types';
import { asyncHandler } from '../middleware/error';

const userService = new UserService();

export const login = asyncHandler(async (req: Request, res: Response) => {
  const credentials: LoginRequest = req.body;
  
  const authResponse: AuthResponse = await userService.login(credentials);
  
  const response: ApiResponse<AuthResponse> = {
    success: true,
    data: authResponse,
    message: '登录成功'
  };
  
  res.json(response);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      error: '未授权访问'
    };
    res.status(401).json(response);
    return;
  }

  const user = await userService.getUserById(req.user.id);
  
  if (!user) {
    const response: ApiResponse = {
      success: false,
      error: '用户不存在'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse = {
    success: true,
    data: user
  };
  
  res.json(response);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      error: '未授权访问'
    };
    res.status(401).json(response);
    return;
  }

  const { oldPassword, newPassword } = req.body;
  
  await userService.changePassword(req.user.id, oldPassword, newPassword);
  
  const response: ApiResponse = {
    success: true,
    message: '密码修改成功'
  };
  
  res.json(response);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // 前端需要删除token，这里只返回成功响应
  const response: ApiResponse = {
    success: true,
    message: '退出成功'
  };
  
  res.json(response);
});