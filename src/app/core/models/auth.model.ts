export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  gender: boolean;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface TokenModelDto {
  token?: string;
  refreshToken?: string;
}

export interface AuthenticationResponseDto {
  token: string;
  expiresAt: string;
  personName?: string;
  email?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: string;
  userId?: string;
  roles?: string[];
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  roles: string[];
  createdAt?: string;
}

export interface AuthResult {
  isSuccess: boolean;
  error?: string;
  data?: AuthenticationResponseDto;
}
