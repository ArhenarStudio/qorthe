export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  user: AuthUser;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface SignInData {
  email: string;
  password: string;
}
