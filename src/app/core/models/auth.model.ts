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

export interface ConfirmEmailDto {
  userId: string;
  token: string;
}

export interface ResendEmailConfirmationDto {
  email: string;
  clientURI: string;
}

export interface ForgotPasswordDto {
  email: string;
  clientURI: string;
}

export interface ResetPasswordDto {
  userId: string;
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface GoogleLoginDto {
  token: string;
}

export interface TokenModelDto {
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthenticationResponseDto {
  accessToken: string;
  expiresAt: string;
  personName?: string;
  email?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: string;
  userId?: string;
  roles?: string[];
  requiresEmailConfirmation?: boolean;
  message?: string;
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


export interface UserProfile {
  id: string;
  userName?: string;
  email?: string;
  fullName?: string;
  address?: string;
  imageUrl?: string;
  phoneNumber?: string;
  gender?: boolean;
  createdAt?: string;
  emailConfirmed?: boolean;
  phoneNumberConfirmed?: boolean;
}
