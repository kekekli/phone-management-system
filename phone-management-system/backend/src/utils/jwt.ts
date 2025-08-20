import jwt from 'jsonwebtoken';
import { User } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  id: number;
  username: string;
  role: string;
}

export const generateToken = (user: Omit<User, 'password'>): string => {
  const payload: JwtPayload = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'phone-management-system',
    subject: user.id.toString()
  });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return payload;
  } catch (error) {
    console.error('Token验证失败:', error);
    return null;
  }
};

export const refreshToken = (token: string): string | null => {
  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  // 生成新token
  return jwt.sign(
    {
      id: payload.id,
      username: payload.username,
      role: payload.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'phone-management-system',
      subject: payload.id.toString()
    }
  );
};