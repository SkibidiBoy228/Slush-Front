import { apiRequest } from "./client";

import type {
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
} from "../types/auth";

export async function register(
  data: RegisterRequest
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/Auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function login(
  data: LoginRequest
): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}


export interface ForgotPasswordRequest{
  email: string;
}

export interface ForgotPasswordResponse{
  message: string;
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>(
    "/api/Auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export interface ResetPasswordRequest{
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse{
  message: string;
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>(
    "/api/Auth/reset-password",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

