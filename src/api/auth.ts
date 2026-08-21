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