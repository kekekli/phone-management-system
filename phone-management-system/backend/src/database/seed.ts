import bcrypt from 'bcryptjs';
import database from './connection';
import { runMigrations } from './migrate';

const seedData = {
  users: [
    {
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      name: '系统管理员',
      department: '技术部',
      email: 'admin@company.com'
    },
    {
      username: 'manager',
      password: 'manager123',
      role: 'manager',
      name: '运营经理',
      department: '运营部',
      email: 'manager@company.com'
    },
    {
      username: 'user1',
      password: 'user123',
      role: 'user',
      name: '张小明',
      department: '内容部',
      email: 'zhangxm@company.com'
    },
    {
      username: 'user2',
      password: 'user123',
      role: 'user',
      name: '李小红',
      department: '推广部',
      email: 'lixh@company.com'
    },
    {
      username: 'user3',
      password: 'user123',
      role: 'user',
      name: '王小华',
      department: '内容部',
      email: 'wangxh@company.com'
    }
  ],

  phoneNumbers: [
    {
      phone_number: '13800138001',
      carrier: '移动',
      plan_type: '5G畅享套餐',
      monthly_fee: 59.00,
      status: 'active',
      assigned_to: 3,
      purchase_date: '2024-01-15',
      contract_end_date: '2025-01-15',
      remarks: '主要用于抖音账号'
    },
    {
      phone_number: '13800138002',
      carrier: '联通',
      plan_type: '沃派套餐',
      monthly_fee: 39.00,
      status: 'active',
      assigned_to: 4,
      purchase_date: '2024-02-01',
      contract_end_date: '2025-02-01',
      remarks: '小红书专用'
    },
    {
      phone_number: '13800138003',
      carrier: '电信',
      plan_type: '天翼套餐',
      monthly_fee: 89.00,
      status: 'active',
      assigned_to: 5,
      purchase_date: '2024-01-20',
      contract_end_date: '2025-01-20',
      remarks: '微信公众号运营'
    },
    {
      phone_number: '13800138004',
      carrier: '移动',
      plan_type: '神州行',
      monthly_fee: 29.00,
      status: 'active',
      assigned_to: null,
      purchase_date: '2024-03-01',
      contract_end_date: null,
      remarks: '备用号码'
    },
    {
      phone_number: '13800138005',
      carrier: '联通',
      plan_type: '冰激凌套餐',
      monthly_fee: 199.00,
      status: 'inactive',
      assigned_to: null,
      purchase_date: '2023-12-01',
      contract_end_date: '2024-12-01',
      remarks: '已停用'
    }
  ],

  platformBindings: [
    {
      phone_id: 1,
      platform_name: '抖音',
      account_name: '美食探店小分队',
      account_id: 'foodie_explorer',
      binding_date: '2024-01-20',
      status: 'active',
      remarks: '主账号'
    },
    {
      phone_id: 1,
      platform_name: '小红书',
      account_name: '美食日记',
      account_id: 'food_diary_123',
      binding_date: '2024-02-01',
      status: 'active',
      remarks: '备用账号'
    },
    {
      phone_id: 2,
      platform_name: '小红书',
      account_name: '穿搭分享',
      account_id: 'fashion_share',
      binding_date: '2024-02-05',
      status: 'active',
      remarks: '时尚类内容'
    },
    {
      phone_id: 3,
      platform_name: '微信',
      account_name: '生活小助手',
      account_id: 'life_helper_wx',
      binding_date: '2024-01-25',
      status: 'active',
      remarks: '公众号'
    },
    {
      phone_id: 3,
      platform_name: '微博',
      account_name: '生活达人',
      account_id: 'life_expert_wb',
      binding_date: '2024-02-10',
      status: 'active',
      remarks: '生活类博主'
    }
  ],

  expenseRecords: [
    { phone_id: 1, year_month: '2024-01', actual_fee: 59.00, base_fee: 59.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 },
    { phone_id: 1, year_month: '2024-02', actual_fee: 65.50, base_fee: 59.00, extra_fee: 6.50, fee_type: 'monthly', description: '超出流量费用', recorded_by: 2 },
    { phone_id: 1, year_month: '2024-03', actual_fee: 59.00, base_fee: 59.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 },
    
    { phone_id: 2, year_month: '2024-02', actual_fee: 39.00, base_fee: 39.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 },
    { phone_id: 2, year_month: '2024-03', actual_fee: 42.30, base_fee: 39.00, extra_fee: 3.30, fee_type: 'monthly', description: '增值服务费', recorded_by: 2 },
    
    { phone_id: 3, year_month: '2024-01', actual_fee: 89.00, base_fee: 89.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 },
    { phone_id: 3, year_month: '2024-02', actual_fee: 89.00, base_fee: 89.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 },
    { phone_id: 3, year_month: '2024-03', actual_fee: 96.80, base_fee: 89.00, extra_fee: 7.80, fee_type: 'monthly', description: '国际漫游费', recorded_by: 2 },
    
    { phone_id: 4, year_month: '2024-03', actual_fee: 29.00, base_fee: 29.00, extra_fee: 0.00, fee_type: 'monthly', description: '正常月租', recorded_by: 2 }
  ]
};

async function seedDatabase(): Promise<void> {
  console.log('开始插入种子数据...');

  try {
    // 先运行迁移
    await runMigrations();

    // 清除现有数据
    await database.run('DELETE FROM expense_records');
    await database.run('DELETE FROM platform_bindings');
    await database.run('DELETE FROM phone_numbers');
    await database.run('DELETE FROM users');

    // 插入用户数据
    for (const user of seedData.users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await database.run(
        `INSERT INTO users (username, password, role, name, department, email) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.username, hashedPassword, user.role, user.name, user.department, user.email]
      );
    }
    console.log('用户数据插入完成');

    // 插入手机号码数据
    for (const phone of seedData.phoneNumbers) {
      await database.run(
        `INSERT INTO phone_numbers (phone_number, carrier, plan_type, monthly_fee, status, assigned_to, purchase_date, contract_end_date, remarks) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [phone.phone_number, phone.carrier, phone.plan_type, phone.monthly_fee, phone.status, phone.assigned_to, phone.purchase_date, phone.contract_end_date, phone.remarks]
      );
    }
    console.log('手机号码数据插入完成');

    // 插入平台绑定数据
    for (const binding of seedData.platformBindings) {
      await database.run(
        `INSERT INTO platform_bindings (phone_id, platform_name, account_name, account_id, binding_date, status, remarks) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [binding.phone_id, binding.platform_name, binding.account_name, binding.account_id, binding.binding_date, binding.status, binding.remarks]
      );
    }
    console.log('平台绑定数据插入完成');

    // 插入费用记录数据
    for (const expense of seedData.expenseRecords) {
      await database.run(
        `INSERT INTO expense_records (phone_id, year_month, actual_fee, base_fee, extra_fee, fee_type, description, recorded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [expense.phone_id, expense.year_month, expense.actual_fee, expense.base_fee, expense.extra_fee, expense.fee_type, expense.description, expense.recorded_by]
      );
    }
    console.log('费用记录数据插入完成');

    console.log('种子数据插入完成！');
    console.log('默认账号信息：');
    console.log('管理员: admin / admin123');
    console.log('经理: manager / manager123');
    console.log('用户: user1 / user123');

  } catch (error) {
    console.error('种子数据插入失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，则执行种子数据插入
if (require.main === module) {
  seedDatabase().catch((error) => {
    console.error('种子数据插入失败:', error);
    process.exit(1);
  });
}

export { seedDatabase };