import { Router } from 'express';
import { login, getCurrentUser, changePassword, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { loginSchema } from '../utils/validation';
import Joi from 'joi';

const router = Router();

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

// 登录
router.post('/login', validateBody(loginSchema), login);

// 获取当前用户信息
router.get('/me', authenticateToken, getCurrentUser);

// 修改密码
router.post('/change-password', authenticateToken, validateBody(changePasswordSchema), changePassword);

// 退出登录
router.post('/logout', authenticateToken, logout);

export default router;