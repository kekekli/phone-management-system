import database from './connection';

const migrations = [
  // 用户表
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'manager', 'user')) NOT NULL DEFAULT 'user',
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 手机号码表
  `CREATE TABLE IF NOT EXISTS phone_numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    carrier TEXT CHECK(carrier IN ('移动', '联通', '电信')) NOT NULL,
    plan_type TEXT NOT NULL,
    monthly_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status TEXT CHECK(status IN ('active', 'inactive', 'expired', 'pending_cancellation')) NOT NULL DEFAULT 'active',
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    purchase_date DATE NOT NULL,
    contract_end_date DATE,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 平台绑定表
  `CREATE TABLE IF NOT EXISTS platform_bindings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_id INTEGER NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
    platform_name TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_id TEXT NOT NULL,
    binding_date DATE NOT NULL,
    status TEXT CHECK(status IN ('active', 'inactive', 'banned')) NOT NULL DEFAULT 'active',
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 费用记录表
  `CREATE TABLE IF NOT EXISTS expense_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_id INTEGER NOT NULL REFERENCES phone_numbers(id) ON DELETE CASCADE,
    year_month TEXT NOT NULL,
    actual_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    base_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    extra_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    fee_type TEXT CHECK(fee_type IN ('monthly', 'setup', 'penalty', 'other')) NOT NULL DEFAULT 'monthly',
    description TEXT,
    recorded_by INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // 创建索引
  `CREATE INDEX IF NOT EXISTS idx_phone_numbers_status ON phone_numbers(status)`,
  `CREATE INDEX IF NOT EXISTS idx_phone_numbers_assigned_to ON phone_numbers(assigned_to)`,
  `CREATE INDEX IF NOT EXISTS idx_platform_bindings_phone_id ON platform_bindings(phone_id)`,
  `CREATE INDEX IF NOT EXISTS idx_platform_bindings_platform ON platform_bindings(platform_name)`,
  `CREATE INDEX IF NOT EXISTS idx_expense_records_phone_id ON expense_records(phone_id)`,
  `CREATE INDEX IF NOT EXISTS idx_expense_records_year_month ON expense_records(year_month)`,

  // 创建触发器：自动更新 updated_at
  `CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
   AFTER UPDATE ON users
   BEGIN
     UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
   END`,

  `CREATE TRIGGER IF NOT EXISTS update_phone_numbers_updated_at 
   AFTER UPDATE ON phone_numbers
   BEGIN
     UPDATE phone_numbers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
   END`,

  `CREATE TRIGGER IF NOT EXISTS update_platform_bindings_updated_at 
   AFTER UPDATE ON platform_bindings
   BEGIN
     UPDATE platform_bindings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
   END`
];

export async function runMigrations(): Promise<void> {
  console.log('开始数据库迁移...');
  
  try {
    for (const migration of migrations) {
      await database.run(migration);
    }
    console.log('数据库迁移完成');
  } catch (error) {
    console.error('数据库迁移失败:', error);
    throw error;
  }
}

// 如果直接运行此文件，则执行迁移
if (require.main === module) {
  runMigrations().catch((error) => {
    console.error('迁移失败:', error);
    process.exit(1);
  });
}