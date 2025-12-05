/**
 * Role-based access control helpers for frontend
 */

export interface UserPermissions {
  is_hr_recruiter: boolean;
  is_hr_manager: boolean;
  is_it_support: boolean;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface UserWithPermissions {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  groups: string[];
  permissions: UserPermissions;
}

/**
 * Check if user has HR Recruiter role
 */
export function isHRRecruiter(user: UserWithPermissions | null): boolean {
  return user?.permissions?.is_hr_recruiter || false;
}

/**
 * Check if user has HR Manager role
 */
export function isHRManager(user: UserWithPermissions | null): boolean {
  return user?.permissions?.is_hr_manager || false;
}

/**
 * Check if user has IT Support role
 */
export function isITSupport(user: UserWithPermissions | null): boolean {
  return user?.permissions?.is_it_support || false;
}

/**
 * Check if user has any HR role (Recruiter or Manager)
 */
export function isHRStaff(user: UserWithPermissions | null): boolean {
  return isHRRecruiter(user) || isHRManager(user);
}

/**
 * Check if user can access token monitoring
 */
export function canAccessTokenMonitoring(user: UserWithPermissions | null): boolean {
  return isHRManager(user) || isITSupport(user);
}

/**
 * Check if user can manage users
 */
export function canManageUsers(user: UserWithPermissions | null): boolean {
  return isHRManager(user) || isITSupport(user) || user?.permissions?.is_superuser || false;
}

/**
 * Check if user can access analytics
 */
export function canAccessAnalytics(user: UserWithPermissions | null): boolean {
  return isHRManager(user) || user?.permissions?.is_superuser || false;
}

/**
 * Check if user can manage questions
 */
export function canManageQuestions(user: UserWithPermissions | null): boolean {
  return isHRManager(user) || user?.permissions?.is_superuser || false;
}

/**
 * Filter navigation items based on user permissions
 */
export function getFilteredNavigation(user: UserWithPermissions | null) {
  const allItems = [
    { name: "Overview", href: "/hr-dashboard", icon: "📊", roles: ["all"] },
    { name: "HR Review Queue", href: "/hr-dashboard/interviews", icon: "📋", roles: ["hr_staff"] },
    { name: "Interview Results", href: "/hr-dashboard/results", icon: "📋", roles: ["hr_staff"] },
    { name: "Applicant History", href: "/hr-dashboard/history", icon: "📚", roles: ["hr_staff"] },
    { name: "Applicants", href: "/hr-dashboard/applicants", icon: "👥", roles: ["hr_staff"] },
    { name: "Analytics", href: "/hr-dashboard/analytics", icon: "📈", roles: ["hr_manager"] },
    { name: "AI vs HR Comparison", href: "/hr-dashboard/ai-comparison", icon: "⚖️", roles: ["hr_manager"] },
    {
      name: "Token Monitoring",
      href: "/hr-dashboard/token-monitoring",
      icon: "💰",
      roles: ["hr_manager", "it_support"],
    },
    { name: "Questions", href: "/hr-dashboard/questions", icon: "❓", roles: ["hr_manager"] },
    { name: "Position Types", href: "/hr-dashboard/position-types", icon: "💼", roles: ["hr_manager"] },
    { name: "Question Types", href: "/hr-dashboard/question-types", icon: "🏷️", roles: ["hr_manager"] },
    { name: "Users", href: "/hr-dashboard/users", icon: "👤", roles: ["hr_manager", "it_support"] },
  ];

  return allItems.filter((item) => {
    if (item.roles.includes("all")) return true;

    if (item.roles.includes("hr_staff") && isHRStaff(user)) return true;
    if (item.roles.includes("hr_manager") && isHRManager(user)) return true;
    if (item.roles.includes("it_support") && isITSupport(user)) return true;
    if (user?.permissions?.is_superuser) return true;

    return false;
  });
}
