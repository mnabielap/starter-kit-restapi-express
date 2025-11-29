export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  is_email_verified: number; // 0 or 1
  created_at: string;
  updated_at: string;
}

export interface Token {
  id: number;
  token: string;
  user_id: number;
  type: string;
  expires: string;
  blacklisted: number;
}

export interface PaginatedResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}