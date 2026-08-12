import { createContext, useContext, type ReactNode } from "react";
import type { AuthUser } from "../lib/auth";

const AdminUserContext = createContext<AuthUser | null>(null);

export function AdminUserProvider({ user, children }: { user: AuthUser; children: ReactNode }) {
  return <AdminUserContext.Provider value={user}>{children}</AdminUserContext.Provider>;
}

export function useAdminUser(): AuthUser | null {
  return useContext(AdminUserContext);
}
