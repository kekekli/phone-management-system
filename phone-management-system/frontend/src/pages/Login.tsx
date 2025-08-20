import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { LoginRequest } from '../types';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 如果已经登录，重定向到首页
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: LoginRequest) => {
    try {
      setLoading(true);
      await login(values);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('登录失败:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="text-gray-900">
              手机号码管理系统
            </Title>
            <Text type="secondary">
              请使用您的账号登录系统
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
            layout="vertical"
          >
            <Form.Item
              label="用户名"
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户名" 
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? <Spin size="small" /> : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <div className="mt-6 text-center">
            <div className="bg-gray-50 p-4 rounded-lg">
              <Text type="secondary" className="text-sm">
                <strong>测试账号：</strong>
              </Text>
              <div className="mt-2 space-y-1 text-xs">
                <div>管理员：admin / admin123</div>
                <div>经理：manager / manager123</div>
                <div>用户：user1 / user123</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;