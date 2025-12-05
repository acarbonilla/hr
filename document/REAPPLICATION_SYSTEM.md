# Reapplication System Implementation

## Overview

The system now allows applicants to reapply after their waiting period has expired. This works automatically through the registration process without requiring manual intervention from HR.

## How It Works

### 1. Automatic Reapplication Date Setting

When an applicant's status changes to one of the following, a reapplication date is automatically set:

| Status                 | Waiting Period      | Reason                                    |
| ---------------------- | ------------------- | ----------------------------------------- |
| **Failed** (Interview) | 30 days             | Give applicant time to improve skills     |
| **Passed** (Interview) | 180 days (6 months) | If not hired, allow them to reapply later |
| **Failed Training**    | 90 days             | Give more time to prepare for training    |
| **Failed Onboarding**  | 180 days (6 months) | Significant time needed before retry      |

### 2. Registration Validation Logic

When someone tries to register with an existing email:

#### ✅ ALLOWED TO REAPPLY:

- **Failed/Passed/Failed Training/Failed Onboarding** - If reapplication date has passed
  - System updates the existing applicant record
  - Status reset to "Pending"
  - Reapplication date cleared
  - Application date updated to today
  - Preserves applicant ID (maintains interview history)

#### ❌ BLOCKED FROM REAPPLYING:

1. **Waiting Period Not Expired**

   - Error shown with exact date they can reapply
   - Example: "You can reapply after December 15, 2025 (29 days remaining after interview failure)"

2. **Application In Progress** (Status: Pending or In Review)

   - Error: "Your application is currently being processed. Please wait for the result."

3. **Already Hired**
   - Error: "You are already hired. Please contact HR if you have any questions."

### 3. What Happens During Reapplication

When an eligible applicant reapplies:

1. ✓ Same applicant record is updated (ID preserved)
2. ✓ Status changes to "Pending"
3. ✓ Reapplication date is cleared
4. ✓ Application date updated to today
5. ✓ New contact info (phone, name) updated
6. ✓ Previous interview records remain linked to applicant
7. ✓ Previous results remain in database for history

**Benefits of updating existing record:**

- Complete history preserved
- Can track how many times someone applied
- Can compare performance across attempts
- Maintains referential integrity with interviews and results

## Frontend Experience

### Applicants Table (HR Dashboard)

Shows clear information about reapplication eligibility:

| Column        | Shows                           |
| ------------- | ------------------------------- |
| Name          | Applicant name with ID          |
| Position      | Position they applied for       |
| Result        | ✓ Pass / ⚠ Review / ✗ Failed    |
| HR Review     | Auto / Needs Review / Reviewed  |
| Reapplication | Date or "Can reapply now" badge |
| Actions       | Edit button                     |

### Registration Form

When someone tries to register:

- If email exists and waiting period hasn't passed: Shows clear error with date
- If email exists and eligible: Registration proceeds normally
- New applicant: Registration proceeds normally

## Testing

Run these test scripts to verify functionality:

```bash
# Check current reapplication eligibility
python backend/test_reapplication.py

# Test reapplication flow
python backend/test_reapplication_flow.py
```

## Example Scenarios

### Scenario 1: John Travolta (Failed Interview)

- Failed interview on November 16, 2025
- Reapplication date: December 15, 2025 (30 days later)
- If tries to register on November 20: ❌ Blocked with date
- If tries to register on December 16: ✅ Allowed to reapply

### Scenario 2: Lebron James (Passed Interview)

- Passed interview on November 16, 2025
- Reapplication date: May 15, 2026 (180 days later)
- Reason: If they don't get hired, they can apply again after 6 months
- If tries to register before May 15: ❌ Blocked with date
- If tries to register after May 15: ✅ Allowed to reapply

### Scenario 3: Red Rose (Failed Training)

- Failed training on November 16, 2025
- Reapplication date: February 14, 2026 (90 days later)
- Needs more time to prepare for training requirements
- If tries to register before February 14: ❌ Blocked with date
- If tries to register after February 14: ✅ Allowed to reapply

## Code Changes Made

### Backend Files Modified:

1. **`backend/applicants/serializers.py`**

   - Updated `ApplicantCreateSerializer.validate_email()` to handle all reapplication statuses
   - Removed default email validators to implement custom logic
   - Added better error messages for different statuses
   - Updated `create()` method to handle reapplication for all statuses

2. **`backend/applicants/models.py`**
   - Already had reapplication date logic in `save()` method
   - Already included 'passed' status in reapplication logic (added in previous session)

### Frontend Files Modified:

3. **`frontend/app/hr-dashboard/applicants/page.tsx`**
   - Simplified table to show only essential columns
   - Added Result and HR Review columns
   - Removed redundant columns (Email, Phone, Source, Status, Date)
   - Made table more recruiter-focused

### Test Files Created:

4. **`backend/test_reapplication.py`**

   - Shows current applicants with reapplication dates
   - Displays eligibility status for each

5. **`backend/test_reapplication_flow.py`**
   - Tests reapplication validation logic
   - Tests all status scenarios
   - Verifies blocking logic works correctly

## Benefits of This Implementation

✓ **No Manual Intervention Needed** - System handles reapplication automatically
✓ **Clear Communication** - Applicants see exact date they can reapply
✓ **Preserves History** - All previous attempts and results remain in database
✓ **Fair Process** - Consistent waiting periods based on failure reason
✓ **Simple for HR** - Just need to monitor the applicants table
✓ **Flexible** - Can adjust waiting periods by changing model constants

## Future Enhancements (Optional)

1. **Email Notification** - Send email when waiting period ends
2. **Dashboard Widget** - Show "X applicants eligible to reapply today"
3. **Analytics** - Track reapplication success rates
4. **Variable Waiting Periods** - Allow HR to adjust per applicant
5. **Reapplication History** - Add dedicated view showing all attempts
