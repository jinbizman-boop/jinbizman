import { apiFetch } from "./api";

export interface AuthUser {
  id: number;
  email: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/auth/me");
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const result = await apiFetch<{ user?: AuthUser } | AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return ("user" in result && result.user ? result.user : result) as AuthUser;
}

export async function logout(): Promise<void> {
  await apiFetch<unknown>("/api/auth/logout", { method: "POST" });
}
