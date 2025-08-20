import { Router } from 'express';
import {
  getPhoneNumbers,
  getPhoneNumberById,
  createPhoneNumber,
  updatePhoneNumber,
  deletePhoneNumber,
  getPhoneNumberStats,
  batchUpdatePhoneNumbers,
  batchDeletePhoneNumbers
} from '../controllers/phoneNumberController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { phoneNumberSchema, updatePhoneNumberSchema, phoneNumberFiltersSchema } from '../utils/validation';
import Joi from 'joi';

const router = Router();

// 验证ID参数
const idParamSchema = Joi.object({
  id: Joi.number().integer().min(1).required()
});

// 批量操作验证
const batchUpdateSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().min(1)).min(1).required(),
  updates: updatePhoneNumberSchema.required()
});

const batchDeleteSchema = Joi.object({
  ids: Joi.array().items(Joi.number().integer().min(1)).min(1).required()
});

// 所有路由都需要认证
router.use(authenticateToken);

// 获取手机号码列表 - 所有角色都可以访问，但数据会根据角色过滤
router.get('/', validateQuery(phoneNumberFiltersSchema), getPhoneNumbers);

// 获取手机号码统计 - 管理员和经理可以访问
router.get('/stats', authorizeRoles('admin', 'manager'), getPhoneNumberStats);

// 获取单个手机号码详情
router.get('/:id', validateParams(idParamSchema), getPhoneNumberById);

// 创建手机号码 - 管理员和经理可以创建
router.post('/', authorizeRoles('admin', 'manager'), validateBody(phoneNumberSchema), createPhoneNumber);

// 更新手机号码 - 管理员和经理可以更新所有，普通用户可以更新分配给自己的
router.put('/:id', validateParams(idParamSchema), validateBody(updatePhoneNumberSchema), updatePhoneNumber);

// 删除手机号码 - 只有管理员可以删除
router.delete('/:id', authorizeRoles('admin'), validateParams(idParamSchema), deletePhoneNumber);

// 批量更新手机号码 - 管理员和经理可以操作
router.patch('/batch', authorizeRoles('admin', 'manager'), validateBody(batchUpdateSchema), batchUpdatePhoneNumbers);

// 批量删除手机号码 - 只有管理员可以操作
router.delete('/batch', authorizeRoles('admin'), validateBody(batchDeleteSchema), batchDeletePhoneNumbers);

export default router;