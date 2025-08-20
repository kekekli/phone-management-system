import database from '../database/connection';
import { PhoneNumber, PhoneNumberFilters, PaginatedResponse } from '../types';
import { AppError } from '../middleware/error';

export class PhoneNumberService {
  async getPhoneNumbers(filters: PhoneNumberFilters, userId?: number, userRole?: string): Promise<PaginatedResponse<PhoneNumber>> {
    const {
      page = 1,
      limit = 20,
      search,
      sort = 'created_at',
      order = 'desc',
      carrier,
      status,
      assigned_to,
      monthly_fee_min,
      monthly_fee_max
    } = filters;

    const offset = (page - 1) * limit;
    const conditions: string[] = [];
    const params: any[] = [];

    // 权限控制：普通用户只能看到分配给自己的号码
    if (userRole === 'user' && userId) {
      conditions.push('p.assigned_to = ?');
      params.push(userId);
    }

    // 搜索条件
    if (search) {
      conditions.push('(p.phone_number LIKE ? OR p.plan_type LIKE ? OR p.remarks LIKE ? OR u.name LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam);
    }

    // 筛选条件
    if (carrier) {
      conditions.push('p.carrier = ?');
      params.push(carrier);
    }

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }

    if (assigned_to) {
      conditions.push('p.assigned_to = ?');
      params.push(assigned_to);
    }

    if (monthly_fee_min !== undefined) {
      conditions.push('p.monthly_fee >= ?');
      params.push(monthly_fee_min);
    }

    if (monthly_fee_max !== undefined) {
      conditions.push('p.monthly_fee <= ?');
      params.push(monthly_fee_max);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM phone_numbers p
      LEFT JOIN users u ON p.assigned_to = u.id
      ${whereClause}
    `;
    
    const totalResult = await database.get<{ total: number }>(countQuery, params);
    const total = totalResult?.total || 0;

    // 获取数据
    const dataQuery = `
      SELECT 
        p.*,
        u.id as assigned_user_id,
        u.name as assigned_user_name,
        u.username as assigned_user_username,
        u.department as assigned_user_department
      FROM phone_numbers p
      LEFT JOIN users u ON p.assigned_to = u.id
      ${whereClause}
      ORDER BY p.${sort} ${order}
      LIMIT ? OFFSET ?
    `;

    const phoneNumbers = await database.all<any>(dataQuery, [...params, limit, offset]);

    // 格式化数据
    const formattedData = phoneNumbers.map((row) => ({
      id: row.id,
      phone_number: row.phone_number,
      carrier: row.carrier,
      plan_type: row.plan_type,
      monthly_fee: row.monthly_fee,
      status: row.status,
      assigned_to: row.assigned_to,
      purchase_date: row.purchase_date,
      contract_end_date: row.contract_end_date,
      remarks: row.remarks,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assigned_user: row.assigned_user_id ? {
        id: row.assigned_user_id,
        name: row.assigned_user_name,
        username: row.assigned_user_username,
        department: row.assigned_user_department
      } : null
    }));

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getPhoneNumberById(id: number, userId?: number, userRole?: string): Promise<PhoneNumber> {
    const query = `
      SELECT 
        p.*,
        u.id as assigned_user_id,
        u.name as assigned_user_name,
        u.username as assigned_user_username,
        u.department as assigned_user_department,
        u.role as assigned_user_role,
        u.email as assigned_user_email
      FROM phone_numbers p
      LEFT JOIN users u ON p.assigned_to = u.id
      WHERE p.id = ?
    `;

    const row = await database.get<any>(query, [id]);

    if (!row) {
      throw new AppError('手机号码不存在', 404);
    }

    // 权限检查：普通用户只能查看分配给自己的号码
    if (userRole === 'user' && userId && row.assigned_to !== userId) {
      throw new AppError('无权查看此手机号码', 403);
    }

    return {
      id: row.id,
      phone_number: row.phone_number,
      carrier: row.carrier,
      plan_type: row.plan_type,
      monthly_fee: row.monthly_fee,
      status: row.status,
      assigned_to: row.assigned_to,
      purchase_date: row.purchase_date,
      contract_end_date: row.contract_end_date,
      remarks: row.remarks,
      created_at: row.created_at,
      updated_at: row.updated_at,
      assigned_user: row.assigned_user_id ? {
        id: row.assigned_user_id,
        name: row.assigned_user_name,
        username: row.assigned_user_username,
        department: row.assigned_user_department,
        role: row.assigned_user_role,
        email: row.assigned_user_email
      } : undefined
    };
  }

  async createPhoneNumber(data: Omit<PhoneNumber, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const {
      phone_number,
      carrier,
      plan_type,
      monthly_fee,
      status = 'active',
      assigned_to,
      purchase_date,
      contract_end_date,
      remarks
    } = data;

    // 检查手机号码是否已存在
    const existing = await database.get(
      'SELECT id FROM phone_numbers WHERE phone_number = ?',
      [phone_number]
    );

    if (existing) {
      throw new AppError('手机号码已存在', 409);
    }

    // 如果指定了分配用户，检查用户是否存在
    if (assigned_to) {
      const user = await database.get('SELECT id FROM users WHERE id = ?', [assigned_to]);
      if (!user) {
        throw new AppError('指定的用户不存在', 400);
      }
    }

    await database.run(
      `INSERT INTO phone_numbers (phone_number, carrier, plan_type, monthly_fee, status, assigned_to, purchase_date, contract_end_date, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [phone_number, carrier, plan_type, monthly_fee, status, assigned_to, purchase_date, contract_end_date, remarks]
    );

    const newPhone = await database.get<{ id: number }>(
      'SELECT id FROM phone_numbers WHERE phone_number = ?',
      [phone_number]
    );

    if (!newPhone) {
      throw new AppError('创建手机号码失败', 500);
    }

    return newPhone.id;
  }

  async updatePhoneNumber(id: number, updates: Partial<Omit<PhoneNumber, 'id' | 'created_at' | 'updated_at'>>, userId?: number, userRole?: string): Promise<void> {
    // 先检查号码是否存在
    const existingPhone = await this.getPhoneNumberById(id, userId, userRole);

    // 权限检查：普通用户只能修改分配给自己的号码
    if (userRole === 'user' && userId && existingPhone.assigned_to !== userId) {
      throw new AppError('无权修改此手机号码', 403);
    }

    // 如果更新手机号码，检查是否冲突
    if (updates.phone_number && updates.phone_number !== existingPhone.phone_number) {
      const existing = await database.get(
        'SELECT id FROM phone_numbers WHERE phone_number = ? AND id != ?',
        [updates.phone_number, id]
      );

      if (existing) {
        throw new AppError('手机号码已存在', 409);
      }
    }

    // 如果更新分配用户，检查用户是否存在
    if (updates.assigned_to !== undefined) {
      if (updates.assigned_to) {
        const user = await database.get('SELECT id FROM users WHERE id = ?', [updates.assigned_to]);
        if (!user) {
          throw new AppError('指定的用户不存在', 400);
        }
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return;
    }

    updateValues.push(id);

    await database.run(
      `UPDATE phone_numbers SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
  }

  async deletePhoneNumber(id: number, userId?: number, userRole?: string): Promise<void> {
    // 检查号码是否存在和权限
    await this.getPhoneNumberById(id, userId, userRole);

    // 检查是否有关联的平台绑定
    const platformBindings = await database.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM platform_bindings WHERE phone_id = ?',
      [id]
    );

    if (platformBindings && platformBindings.count > 0) {
      throw new AppError('无法删除：该号码还有关联的平台绑定记录', 400);
    }

    // 检查是否有费用记录
    const expenseRecords = await database.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM expense_records WHERE phone_id = ?',
      [id]
    );

    if (expenseRecords && expenseRecords.count > 0) {
      throw new AppError('无法删除：该号码还有费用记录', 400);
    }

    await database.run('DELETE FROM phone_numbers WHERE id = ?', [id]);
  }

  async getPhoneNumberStats(): Promise<any> {
    // 按运营商统计
    const carrierStats = await database.all<{ carrier: string; count: number }>(
      'SELECT carrier, COUNT(*) as count FROM phone_numbers GROUP BY carrier ORDER BY count DESC'
    );

    // 按状态统计
    const statusStats = await database.all<{ status: string; count: number }>(
      'SELECT status, COUNT(*) as count FROM phone_numbers GROUP BY status ORDER BY count DESC'
    );

    // 月费统计
    const feeStats = await database.get<{ total_fee: number; avg_fee: number; min_fee: number; max_fee: number }>(
      'SELECT SUM(monthly_fee) as total_fee, AVG(monthly_fee) as avg_fee, MIN(monthly_fee) as min_fee, MAX(monthly_fee) as max_fee FROM phone_numbers WHERE status = "active"'
    );

    // 最近新增的号码
    const recentPhones = await database.all<PhoneNumber>(
      'SELECT * FROM phone_numbers ORDER BY created_at DESC LIMIT 5'
    );

    return {
      carrier_stats: carrierStats,
      status_stats: statusStats,
      fee_stats: feeStats,
      recent_phones: recentPhones
    };
  }
}