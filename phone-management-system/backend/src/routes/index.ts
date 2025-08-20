import { Router } from 'express';
import authRoutes from './auth';
import phoneNumberRoutes from './phoneNumbers';

const router = Router();

// API版本前缀
const API_VERSION = '/api/v1';

// 认证相关路由
router.use(`${API_VERSION}/auth`, authRoutes);

// 手机号码相关路由
router.use(`${API_VERSION}/phone-numbers`, phoneNumberRoutes);

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;