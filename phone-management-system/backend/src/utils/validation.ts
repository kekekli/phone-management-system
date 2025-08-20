import Joi from 'joi';

// 用户相关验证
export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required()
});

export const userSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'manager', 'user').required(),
  name: Joi.string().min(2).max(50).required(),
  department: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required()
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(50),
  password: Joi.string().min(6),
  role: Joi.string().valid('admin', 'manager', 'user'),
  name: Joi.string().min(2).max(50),
  department: Joi.string().min(2).max(50),
  email: Joi.string().email()
});

// 手机号码相关验证
export const phoneNumberSchema = Joi.object({
  phone_number: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
  carrier: Joi.string().valid('移动', '联通', '电信').required(),
  plan_type: Joi.string().min(2).max(50).required(),
  monthly_fee: Joi.number().min(0).precision(2).required(),
  status: Joi.string().valid('active', 'inactive', 'expired', 'pending_cancellation').default('active'),
  assigned_to: Joi.number().integer().min(1).allow(null),
  purchase_date: Joi.date().required(),
  contract_end_date: Joi.date().allow(null),
  remarks: Joi.string().max(500).allow(null, '')
});

export const updatePhoneNumberSchema = Joi.object({
  phone_number: Joi.string().pattern(/^1[3-9]\d{9}$/),
  carrier: Joi.string().valid('移动', '联通', '电信'),
  plan_type: Joi.string().min(2).max(50),
  monthly_fee: Joi.number().min(0).precision(2),
  status: Joi.string().valid('active', 'inactive', 'expired', 'pending_cancellation'),
  assigned_to: Joi.number().integer().min(1).allow(null),
  purchase_date: Joi.date(),
  contract_end_date: Joi.date().allow(null),
  remarks: Joi.string().max(500).allow(null, '')
});

// 平台绑定相关验证
export const platformBindingSchema = Joi.object({
  phone_id: Joi.number().integer().min(1).required(),
  platform_name: Joi.string().min(2).max(50).required(),
  account_name: Joi.string().min(2).max(100).required(),
  account_id: Joi.string().min(2).max(100).required(),
  binding_date: Joi.date().required(),
  status: Joi.string().valid('active', 'inactive', 'banned').default('active'),
  remarks: Joi.string().max(500).allow(null, '')
});

export const updatePlatformBindingSchema = Joi.object({
  phone_id: Joi.number().integer().min(1),
  platform_name: Joi.string().min(2).max(50),
  account_name: Joi.string().min(2).max(100),
  account_id: Joi.string().min(2).max(100),
  binding_date: Joi.date(),
  status: Joi.string().valid('active', 'inactive', 'banned'),
  remarks: Joi.string().max(500).allow(null, '')
});

// 费用记录相关验证
export const expenseRecordSchema = Joi.object({
  phone_id: Joi.number().integer().min(1).required(),
  year_month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
  actual_fee: Joi.number().min(0).precision(2).required(),
  base_fee: Joi.number().min(0).precision(2).required(),
  extra_fee: Joi.number().min(0).precision(2).required(),
  fee_type: Joi.string().valid('monthly', 'setup', 'penalty', 'other').default('monthly'),
  description: Joi.string().max(500).allow(null, '')
});

export const updateExpenseRecordSchema = Joi.object({
  phone_id: Joi.number().integer().min(1),
  year_month: Joi.string().pattern(/^\d{4}-\d{2}$/),
  actual_fee: Joi.number().min(0).precision(2),
  base_fee: Joi.number().min(0).precision(2),
  extra_fee: Joi.number().min(0).precision(2),
  fee_type: Joi.string().valid('monthly', 'setup', 'penalty', 'other'),
  description: Joi.string().max(500).allow(null, '')
});

// 查询参数验证
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(100).allow(''),
  sort: Joi.string().max(50).allow(''),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

export const phoneNumberFiltersSchema = paginationSchema.keys({
  carrier: Joi.string().valid('移动', '联通', '电信').allow(''),
  status: Joi.string().valid('active', 'inactive', 'expired', 'pending_cancellation').allow(''),
  assigned_to: Joi.number().integer().min(1).allow(''),
  monthly_fee_min: Joi.number().min(0).allow(''),
  monthly_fee_max: Joi.number().min(0).allow('')
});

export const platformBindingFiltersSchema = paginationSchema.keys({
  platform_name: Joi.string().max(50).allow(''),
  status: Joi.string().valid('active', 'inactive', 'banned').allow(''),
  phone_id: Joi.number().integer().min(1).allow('')
});

export const expenseFiltersSchema = paginationSchema.keys({
  phone_id: Joi.number().integer().min(1).allow(''),
  year_month: Joi.string().pattern(/^\d{4}-\d{2}$/).allow(''),
  fee_type: Joi.string().valid('monthly', 'setup', 'penalty', 'other').allow('')
});