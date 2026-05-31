export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  restaurant_id: string;
  is_active: boolean;
  created_at: string;
}

export enum UserRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  KITCHEN_STAFF = "KITCHEN_STAFF",
  WAITER = "WAITER",
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  restaurant_name: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
}
