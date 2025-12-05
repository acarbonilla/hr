"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isHRManager } from "@/lib/auth-hr";

export default function UsersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has permission to access this page
    if (!isHRManager()) {
      // Redirect to dashboard if not HR Manager
      router.push("/hr-dashboard");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl shadow-lg">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage HR staff accounts and permissions</p>
          </div>
        </div>
      </div>

      {/* Access Restricted Message */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-purple-100 p-4 rounded-full">
            <svg className="w-16 h-16 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-2">HR Manager Access Required</h2>
            <p className="text-purple-700 max-w-md mx-auto">
              This page is restricted to HR Managers only. User management features include adding, editing, and
              deleting HR staff accounts.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Note:</strong> Only users with the following roles can access this page:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                HR Manager
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                HR Admin
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                System Admin
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            If you believe you should have access to this page, please contact your system administrator.
          </p>
        </div>
      </div>

      {/* Future: User Management Interface will be implemented here */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">User Management Interface</h3>
          <p className="text-gray-500">Coming soon - Full user management features will be available here</p>
          <div className="mt-6 text-left max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-3">Planned features:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>View all HR staff members</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Add new HR accounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Edit user details and roles</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Deactivate/activate accounts</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Role-based permissions (Manager, Recruiter, Staff)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
