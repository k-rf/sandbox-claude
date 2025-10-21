export interface User {
  id: number;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
}

export interface Stats {
  totalUsers: number;
  activeUsers: number;
  lastUpdate: string;
}

export type ValidationError = {
  field: string;
  message: string;
};
