export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly status: "success" | "error";
  readonly message?: string;
  readonly timestamp: string;
}

export interface Stats {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly lastUpdate: string;
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
}
