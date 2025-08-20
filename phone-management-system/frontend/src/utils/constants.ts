export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const CARRIERS = [
  { value: '移动', label: '中国移动' },
  { value: '联通', label: '中国联通' },
  { value: '电信', label: '中国电信' }
];

export const PHONE_STATUS = [
  { value: 'active', label: '激活', color: 'success' },
  { value: 'inactive', label: '停用', color: 'default' },
  { value: 'expired', label: '过期', color: 'error' },
  { value: 'pending_cancellation', label: '待销户', color: 'warning' }
];

export const PLATFORM_STATUS = [
  { value: 'active', label: '正常', color: 'success' },
  { value: 'inactive', label: '停用', color: 'default' },
  { value: 'banned', label: '封禁', color: 'error' }
];

export const FEE_TYPES = [
  { value: 'monthly', label: '月租费' },
  { value: 'setup', label: '开户费' },
  { value: 'penalty', label: '违约金' },
  { value: 'other', label: '其他费用' }
];

export const USER_ROLES = [
  { value: 'admin', label: '管理员' },
  { value: 'manager', label: '经理' },
  { value: 'user', label: '普通用户' }
];

export const POPULAR_PLATFORMS = [
  '抖音', '小红书', '微信', '微博', '快手', '
  'B站', '知乎', '今日头条', '百家号', '企鹅号'
];

export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
export const MONTH_FORMAT = 'YYYY-MM';

export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) =>
    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
};

export const STORAGE_KEYS = {
  TOKEN: 'phone_management_token',
  USER: 'phone_management_user',
  THEME: 'phone_management_theme'
};

export const QUERY_KEYS = {
  USERS: ['users'],
  PHONE_NUMBERS: ['phoneNumbers'],
  PLATFORM_BINDINGS: ['platformBindings'],
  EXPENSE_RECORDS: ['expenseRecords'],
  DASHBOARD_STATS: ['dashboardStats']
};