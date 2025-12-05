/**
 * HR Authentication Helper Functions
 * Handles HR-specific authentication, token management, and role verification
 */

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  role?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

/**
 * Store HR authentication tokens and user data
 */
export function setHRAuth(tokens: AuthTokens, user: User) {
  if (typeof window === "undefined") return;

  localStorage.setItem("hr_authToken", tokens.access);
  localStorage.setItem("hr_refreshToken", tokens.refresh);
  localStorage.setItem("hr_user", JSON.stringify(user));
}

/**
 * Get stored HR access token
 */
export function getHRToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hr_authToken");
}

/**
 * Get stored HR refresh token
 */
export function getHRRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hr_refreshToken");
}

/**
 * Get stored HR user data
 */
export function getHRUser(): User | null {
  if (typeof window === "undefined") return null;

  const userStr = localStorage.getItem("hr_user");
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated as HR
 */
export function isHRAuthenticated(): boolean {
  const token = getHRToken();
  const user = getHRUser();
  return !!(token && user);
}

/**
 * Check if user has HR or admin role
 */
export function isHRRole(): boolean {
  const user = getHRUser();
  if (!user) return false;

  const hrRoles = ["hr_admin", "system_admin", "recruiter"];
  return hrRoles.includes(user.user_type) || hrRoles.includes(user.role || "");
}

/**
 * Check if user is HR Manager (can manage users)
 */
export function isHRManager(): boolean {
  const user = getHRUser();
  if (!user) return false;

  // Only HR Manager and System Admin can manage users
  const managerRoles = ["hr_admin", "hr_manager", "system_admin"];
  return managerRoles.includes(user.user_type) || managerRoles.includes(user.role || "");
}

/**
 * Clear HR authentication data
 */
export function clearHRAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("hr_authToken");
  localStorage.removeItem("hr_refreshToken");
  localStorage.removeItem("hr_user");
}

/**
 * Check if token is expired (basic check)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * Redirect to HR login if not authenticated
 */
export function requireHRAuth(router: any) {
  if (!isHRAuthenticated() || !isHRRole()) {
    router.push("/hr-login");
    return false;
  }
  return true;
}
