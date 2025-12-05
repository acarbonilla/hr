# Role-Based Access Control (RBAC) System

## Overview

Implemented comprehensive RBAC system with Django groups and permissions to control access to different features based on user roles.

## User Roles

### 1. 👔 HR Recruiter

**Purpose:** Day-to-day recruitment operations

**Access:**

- ✅ View applicants and their documents
- ✅ View interviews and video responses
- ✅ View AI analysis results
- ✅ Create, view, and edit interview results (hiring decisions)
- ✅ View questions (read-only)

**Cannot Access:**

- ❌ Analytics dashboard
- ❌ Token monitoring
- ❌ User management
- ❌ Question management
- ❌ System configuration

**Dashboard Pages:**

- Overview
- HR Review Queue
- Interview Results
- Applicant History
- Applicants

---

### 2. 👔 HR Manager

**Purpose:** Senior HR with full recruitment oversight

**Access:**

- ✅ Everything HR Recruiter can do
- ✅ **Analytics dashboard** - View hiring trends and statistics
- ✅ **AI vs HR Comparison** - Analysis of AI recommendations
- ✅ **Token monitoring** - Track API costs
- ✅ **User management** - Create/edit HR staff accounts
- ✅ **Question management** - Add/edit/delete interview questions
- ✅ **Position types** - Manage job positions
- ✅ **Question types** - Manage question categories

**Dashboard Pages:**

- All HR Recruiter pages
- Analytics
- AI vs HR Comparison
- Token Monitoring
- Questions
- Position Types
- Question Types
- Users

---

### 3. 💻 IT Support

**Purpose:** Technical administration and monitoring

**Access:**

- ✅ **Token monitoring** - Full access to API usage and costs
- ✅ **User management** - Create/edit user accounts
- ✅ **System monitoring** - View interviews and applicants (read-only)

**Cannot Access:**

- ❌ Making hiring decisions
- ❌ Analytics dashboard
- ❌ Question management

**Dashboard Pages:**

- Overview (limited)
- Token Monitoring
- Users

---

### 4. 📝 Applicant (Future)

**Purpose:** Self-service portal for applicants

**Access:**

- ✅ View own profile
- ✅ View own interview history
- ✅ Update personal information

**Status:** Reserved for future self-service portal

---

## Setup Commands

### Initial Setup

```bash
# Create groups and assign permissions
python manage.py setup_groups
```

### User Management

```bash
# Assign user to a group
python manage.py assign_user_group <username> "HR Recruiter"
python manage.py assign_user_group <username> "HR Manager"
python manage.py assign_user_group <username> "IT Support"

# Examples
python manage.py assign_user_group john_doe "HR Recruiter"
python manage.py assign_user_group jane_smith "HR Manager"
python manage.py assign_user_group it_support "IT Support"
```

### Creating New Users with Groups

```bash
# Method 1: Create then assign
python manage.py createsuperuser  # Or use Django admin
python manage.py assign_user_group <username> "<group>"

# Method 2: Use Django admin
# 1. Go to http://localhost:8000/admin/accounts/user/
# 2. Create user
# 3. In "Groups" field, select appropriate group
# 4. Check "Staff status"
# 5. Save
```

---

## Backend Implementation

### Permission Classes

Located in `backend/accounts/permissions.py`:

```python
# Use in DRF views
from accounts.permissions import IsHRRecruiter, IsHRManager, IsITSupport, IsHRStaff

class MyView(viewsets.ModelViewSet):
    permission_classes = [IsHRManager]  # Only HR Managers
```

**Available Classes:**

- `IsHRRecruiter` - Only HR Recruiters
- `IsHRManager` - Only HR Managers
- `IsITSupport` - Only IT Support
- `IsHRStaff` - HR Recruiter OR HR Manager
- `IsHRManagerOrITSupport` - HR Manager OR IT Support

### View Decorators

```python
from accounts.permissions import require_group, require_any_group

@require_group('HR Manager')
def my_view(request):
    ...

@require_any_group('HR Manager', 'IT Support')
def monitoring_view(request):
    ...
```

### Helper Functions

```python
from accounts.permissions import user_in_group, user_has_any_group

if user_in_group(user, 'HR Manager'):
    # Do something

if user_has_any_group(user, ['HR Manager', 'IT Support']):
    # Allow access
```

---

## Frontend Implementation

### Permission Helpers

Located in `frontend/lib/permissions.ts`:

```typescript
import {
  isHRRecruiter,
  isHRManager,
  isITSupport,
  canAccessTokenMonitoring,
  canManageUsers,
  getFilteredNavigation,
} from "@/lib/permissions";

// Check roles
if (isHRManager(user)) {
  // Show analytics
}

// Filter navigation
const navItems = getFilteredNavigation(user);
```

**Available Functions:**

- `isHRRecruiter(user)` - Check if HR Recruiter
- `isHRManager(user)` - Check if HR Manager
- `isITSupport(user)` - Check if IT Support
- `isHRStaff(user)` - Check if any HR role
- `canAccessTokenMonitoring(user)` - Can view token dashboard
- `canManageUsers(user)` - Can create/edit users
- `canAccessAnalytics(user)` - Can view analytics
- `canManageQuestions(user)` - Can edit questions
- `getFilteredNavigation(user)` - Get menu items for user role

### User Data Structure

```typescript
interface UserWithPermissions {
  id: number;
  username: string;
  email: string;
  groups: string[];
  permissions: {
    is_hr_recruiter: boolean;
    is_hr_manager: boolean;
    is_it_support: boolean;
    is_staff: boolean;
    is_superuser: boolean;
  };
}
```

### Getting User Permissions

The `/api/accounts/check-auth/` endpoint now returns:

```json
{
  "authenticated": true,
  "user": { ... },
  "groups": ["HR Manager"],
  "permissions": {
    "is_hr_recruiter": false,
    "is_hr_manager": true,
    "is_it_support": false,
    "is_staff": true,
    "is_superuser": false
  }
}
```

---

## Dashboard Navigation

Navigation items are automatically filtered based on user role:

| Page                | HR Recruiter | HR Manager | IT Support |
| ------------------- | ------------ | ---------- | ---------- |
| Overview            | ✅           | ✅         | ✅         |
| HR Review Queue     | ✅           | ✅         | ❌         |
| Interview Results   | ✅           | ✅         | ❌         |
| Applicant History   | ✅           | ✅         | ❌         |
| Applicants          | ✅           | ✅         | ❌         |
| Analytics           | ❌           | ✅         | ❌         |
| AI vs HR Comparison | ❌           | ✅         | ❌         |
| Token Monitoring    | ❌           | ✅         | ✅         |
| Questions           | ❌           | ✅         | ❌         |
| Position Types      | ❌           | ✅         | ❌         |
| Question Types      | ❌           | ✅         | ❌         |
| Users               | ❌           | ✅         | ✅         |

---

## Security Features

### Backend

- ✅ Django permission system enforced at API level
- ✅ DRF permission classes on all viewsets
- ✅ Database-level access control
- ✅ Automatic 403 Forbidden for unauthorized access

### Frontend

- ✅ Navigation items hidden if no access
- ✅ Routes protected with role checks
- ✅ API calls return proper error responses
- ✅ Graceful handling of permission denials

---

## Common Workflows

### Adding New HR Recruiter

```bash
# Option 1: Django admin
1. Login to http://localhost:8000/admin/
2. Go to Accounts > Users > Add user
3. Set username and password
4. Check "Staff status"
5. Add to "HR Recruiter" group
6. Save

# Option 2: Command line
python manage.py createsuperuser  # Create user first
python manage.py assign_user_group <username> "HR Recruiter"
```

### Adding New IT Support Staff

```bash
python manage.py create_it_user <username> --email <email>
# This automatically assigns to IT Support group
```

### Promoting HR Recruiter to Manager

```bash
python manage.py assign_user_group <username> "HR Manager"
# User now has both groups (or remove from Recruiter group via admin)
```

### Checking User's Current Role

```bash
# Via Django admin
http://localhost:8000/admin/accounts/user/<user_id>/change/

# Via API
GET /api/accounts/check-auth/
Authorization: Bearer <token>
```

---

## Best Practices

1. **Principle of Least Privilege**

   - Assign minimum permissions needed
   - Start with HR Recruiter, promote to Manager if needed

2. **Group Management**

   - Use groups, not individual permissions
   - Makes role changes easier

3. **Audit Trail**

   - Django admin logs all permission changes
   - Check admin history for user modifications

4. **Testing Access**

   - Test each role in incognito/private window
   - Verify navigation items show/hide correctly

5. **Password Policy**
   - Require strong passwords for staff accounts
   - Regular password rotation for sensitive roles

---

## Troubleshooting

### User Can't Access Page

1. Check user is in correct group: Django Admin > User > Groups
2. Verify group has permissions: `python manage.py setup_groups` (re-run)
3. Check `is_staff` is True
4. Clear browser cache and re-login

### Navigation Items Not Showing

1. Frontend might have cached user data
2. Logout and login again
3. Check `/api/accounts/check-auth/` response

### Permission Denied Errors

1. Verify backend permission class is correct
2. Check user group membership
3. Look for typos in group names (case-sensitive)

---

## Future Enhancements

1. **Fine-grained Permissions**

   - Department-level access
   - Location-based filtering

2. **Time-based Access**

   - Temporary elevated permissions
   - Access expiration dates

3. **Audit Logging**

   - Track who accessed what
   - Export audit reports

4. **Self-service**
   - Applicant portal with own role
   - View interview feedback
