import { Request, Response } from 'express';
import { PhoneNumberService } from '../services/phoneNumberService';
import { ApiResponse, PhoneNumberFilters, PaginatedResponse, PhoneNumber } from '../types';
import { asyncHandler } from '../middleware/error';

const phoneNumberService = new PhoneNumberService();

export const getPhoneNumbers = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as PhoneNumberFilters;
  const { id: userId, role: userRole } = req.user!;

  const result: PaginatedResponse<PhoneNumber> = await phoneNumberService.getPhoneNumbers(
    filters,
    userId,
    userRole
  );

  const response: ApiResponse<PaginatedResponse<PhoneNumber>> = {
    success: true,
    data: result
  };

  res.json(response);
});

export const getPhoneNumberById = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: userId, role: userRole } = req.user!;

  const phoneNumber = await phoneNumberService.getPhoneNumberById(id, userId, userRole);

  const response: ApiResponse<PhoneNumber> = {
    success: true,
    data: phoneNumber
  };

  res.json(response);
});

export const createPhoneNumber = asyncHandler(async (req: Request, res: Response) => {
  const phoneNumberData = req.body;

  const newId = await phoneNumberService.createPhoneNumber(phoneNumberData);
  const phoneNumber = await phoneNumberService.getPhoneNumberById(newId);

  const response: ApiResponse<PhoneNumber> = {
    success: true,
    data: phoneNumber,
    message: '手机号码创建成功'
  };

  res.status(201).json(response);
});

export const updatePhoneNumber = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const { id: userId, role: userRole } = req.user!;

  await phoneNumberService.updatePhoneNumber(id, updates, userId, userRole);
  const phoneNumber = await phoneNumberService.getPhoneNumberById(id, userId, userRole);

  const response: ApiResponse<PhoneNumber> = {
    success: true,
    data: phoneNumber,
    message: '手机号码更新成功'
  };

  res.json(response);
});

export const deletePhoneNumber = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { id: userId, role: userRole } = req.user!;

  await phoneNumberService.deletePhoneNumber(id, userId, userRole);

  const response: ApiResponse = {
    success: true,
    message: '手机号码删除成功'
  };

  res.json(response);
});

export const getPhoneNumberStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await phoneNumberService.getPhoneNumberStats();

  const response: ApiResponse = {
    success: true,
    data: stats
  };

  res.json(response);
});

export const batchUpdatePhoneNumbers = asyncHandler(async (req: Request, res: Response) => {
  const { ids, updates } = req.body;
  const { id: userId, role: userRole } = req.user!;

  if (!Array.isArray(ids) || ids.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: '请选择要更新的手机号码'
    };
    res.status(400).json(response);
    return;
  }

  const results = [];
  for (const id of ids) {
    try {
      await phoneNumberService.updatePhoneNumber(id, updates, userId, userRole);
      results.push({ id, success: true });
    } catch (error) {
      results.push({ id, success: false, error: (error as Error).message });
    }
  }

  const successCount = results.filter(r => r.success).length;
  
  const response: ApiResponse = {
    success: true,
    data: results,
    message: `批量更新完成：成功 ${successCount} 个，失败 ${results.length - successCount} 个`
  };

  res.json(response);
});

export const batchDeletePhoneNumbers = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body;
  const { id: userId, role: userRole } = req.user!;

  if (!Array.isArray(ids) || ids.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: '请选择要删除的手机号码'
    };
    res.status(400).json(response);
    return;
  }

  const results = [];
  for (const id of ids) {
    try {
      await phoneNumberService.deletePhoneNumber(id, userId, userRole);
      results.push({ id, success: true });
    } catch (error) {
      results.push({ id, success: false, error: (error as Error).message });
    }
  }

  const successCount = results.filter(r => r.success).length;

  const response: ApiResponse = {
    success: true,
    data: results,
    message: `批量删除完成：成功 ${successCount} 个，失败 ${results.length - successCount} 个`
  };

  res.json(response);
});