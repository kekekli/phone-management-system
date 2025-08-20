export interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'user';
  name: string;
  department: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface PhoneNumber {
  id: number;
  phone_number: string;
  carrier: '移动' | '联通' | '电信';
  plan_type: string;
  monthly_fee: number;
  status: 'active' | 'inactive' | 'expired' | 'pending_cancellation';
  assigned_to: number | null;
  purchase_date: string;
  contract_end_date: string | null;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: User;
}

export interface PlatformBinding {
  id: number;
  phone_id: number;
  platform_name: string;
  account_name: string;
  account_id: string;
  binding_date: string;
  status: 'active' | 'inactive' | 'banned';
  remarks: string | null;
  created_at: string;
  updated_at: string;
  phone_number?: PhoneNumber;
}

export interface ExpenseRecord {
  id: number;
  phone_id: number;
  year_month: string;
  actual_fee: number;
  base_fee: number;
  extra_fee: number;
  fee_type: 'monthly' | 'setup' | 'penalty' | 'other';
  description: string | null;
  recorded_by: number;
  created_at: string;
  phone_number?: PhoneNumber;
  recorded_user?: User;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PhoneNumberFilters extends PaginationParams {
  carrier?: string;
  status?: string;
  assigned_to?: number;
  monthly_fee_min?: number;
  monthly_fee_max?: number;
}

export interface PlatformBindingFilters extends PaginationParams {
  platform_name?: string;
  status?: string;
  phone_id?: number;
}

export interface ExpenseFilters extends PaginationParams {
  phone_id?: number;
  year_month?: string;
  fee_type?: string;
}

export interface DashboardStats {
  total_phones: number;
  active_phones: number;
  total_monthly_fee: number;
  platform_bindings: number;
  recent_expenses: ExpenseRecord[];
  phone_by_carrier: Array<{ carrier: string; count: number }>;
  monthly_expenses: Array<{ month: string; total: number }>;
}

export interface CreatePhoneNumberRequest {
  phone_number: string;
  carrier: '移动' | '联通' | '电信';
  plan_type: string;
  monthly_fee: number;
  status?: 'active' | 'inactive' | 'expired' | 'pending_cancellation';
  assigned_to?: number | null;
  purchase_date: string;
  contract_end_date?: string | null;
  remarks?: string | null;
}

export interface UpdatePhoneNumberRequest extends Partial<CreatePhoneNumberRequest> {}

export interface CreatePlatformBindingRequest {
  phone_id: number;
  platform_name: string;
  account_name: string;
  account_id: string;
  binding_date: string;
  status?: 'active' | 'inactive' | 'banned';
  remarks?: string | null;
}

export interface UpdatePlatformBindingRequest extends Partial<CreatePlatformBindingRequest> {}

export interface CreateExpenseRecordRequest {
  phone_id: number;
  year_month: string;
  actual_fee: number;
  base_fee: number;
  extra_fee: number;
  fee_type?: 'monthly' | 'setup' | 'penalty' | 'other';
  description?: string | null;
}

export interface UpdateExpenseRecordRequest extends Partial<CreateExpenseRecordRequest> {}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}