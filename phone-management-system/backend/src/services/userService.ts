import bcrypt from 'bcryptjs';
import database from '../database/connection';
import { User, LoginRequest, ApiResponse, AuthResponse } from '../types';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/error';

export class UserService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { username, password } = credentials;

    // 查找用户
    const user = await database.get<User>(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('用户名或密码错误', 401);
    }

    // 生成token
    const token = generateToken(user);

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async getUserById(id: number): Promise<Omit<User, 'password'> | null> {
    const user = await database.get<User>(
      'SELECT id, username, role, name, department, email, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return user || null;
  }

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await database.all<Omit<User, 'password'>>(
      'SELECT id, username, role, name, department, email, created_at, updated_at FROM users ORDER BY created_at DESC'
    );

    return users;
  }

  async createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const { username, password, role, name, department, email } = userData;

    // 检查用户名是否已存在
    const existingUser = await database.get(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser) {
      throw new AppError('用户名或邮箱已存在', 409);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入用户
    await database.run(
      `INSERT INTO users (username, password, role, name, department, email) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, role, name, department, email]
    );

    // 获取新创建的用户ID
    const newUser = await database.get<{ id: number }>(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (!newUser) {
      throw new AppError('用户创建失败', 500);
    }

    return newUser.id;
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // 构建动态更新查询
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'password') {
          updateFields.push(`${key} = ?`);
          updateValues.push(bcrypt.hashSync(value as string, 10));
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }
    });

    if (updateFields.length === 0) {
      return;
    }

    updateValues.push(id);

    await database.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.getUserById(id);
    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 检查是否有关联的手机号码
    const phoneCount = await database.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM phone_numbers WHERE assigned_to = ?',
      [id]
    );

    if (phoneCount && phoneCount.count > 0) {
      throw new AppError('无法删除用户：该用户还有分配的手机号码', 400);
    }

    await database.run('DELETE FROM users WHERE id = ?', [id]);
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    const user = await database.get<User>(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new AppError('用户不存在', 404);
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new AppError('原密码错误', 400);
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await database.run(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
  }
}