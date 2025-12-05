# HR Review Queue Improvements

## Overview

Enhanced the HR Review Queue to only show applicants that actually need review and remove them once a final hiring decision is made. This prevents confusion and duplicate work for recruiters.

## Problem Statement

Previously, the HR Review Queue showed ALL applicants including:

- Applicants who failed AI interview (scores below 50)
- Applicants already reviewed and decided upon
- Applicants who passed automatically (scores 75+)

This caused confusion as recruiters would see the same applicants repeatedly and couldn't tell which ones actually needed their attention.

## Solution Implemented

### 1. Backend Changes

#### Database Schema Updates (`results/models.py`)

Added new fields to `InterviewResult` model to track final hiring decisions:

- `final_decision` - Choice field: 'hired' or 'rejected'
- `final_decision_date` - Timestamp when decision was made
- `final_decision_by` - Foreign key to User who made the decision
- `final_decision_notes` - Text field for HR notes

#### API Filtering (`results/views.py`)

Enhanced the `get_queryset()` method with new filtering logic:

- **review_queue=true** parameter: Returns only results needing review
  - Excludes results with final decisions already made
  - Only includes scores in review range (50-75) or borderline fails (40-50)
  - Filters out clear passes (75+) and clear fails (<40)

#### New Endpoint (`results/views.py`)

Added `POST /api/results/{id}/final-decision/` endpoint:

- Accepts decision: 'hired' or 'rejected'
- Records decision maker and timestamp
- Updates applicant status accordingly:
  - **Hired**: Sets status to 'hired', clears reapplication_date
  - **Rejected**: Sets status to 'failed', sets reapplication_date to 30 days

#### Updated Serializers (`results/serializers.py`)

- Added `FinalDecisionSerializer` for decision actions
- Updated `InterviewResultListSerializer` to include final_decision fields
- Added `get_final_decision_by_name()` method to show reviewer name

### 2. Frontend Changes

#### HR Review Queue Page (`app/hr-dashboard/interviews/page.tsx`)

**Key Changes:**

- API call now includes `review_queue=true` parameter
- Removed client-side filtering for reviewed items (handled by backend)
- Statistics updated to reflect only pending reviews
- Simplified filtering logic since backend handles the heavy lifting

**What Shows in Queue:**

- ✅ Applicants with scores 50-75 (review range) - no final decision
- ✅ Applicants with scores 40-50 (borderline fails) - no final decision
- ❌ Applicants with scores 75+ (auto-pass)
- ❌ Applicants with scores <40 (clear fail)
- ❌ Applicants with final decisions made (hired/rejected)

#### Review Detail Page (`app/hr-dashboard/results/[id]/review/page.tsx`)

**Added Features:**

1. **Final Decision Section**: Prominent call-to-action box at top of page
2. **Hire Button**: Green button to mark applicant as hired
3. **Reject Button**: Red button to mark applicant as rejected
4. **Decision Modal**: Confirmation dialog with optional notes field
5. **Auto-redirect**: After decision, redirects back to review queue

**Workflow:**

1. HR reviews interview responses
2. HR can override individual question scores if needed
3. HR makes final decision: Hire or Reject
4. Modal asks for confirmation and optional notes
5. Decision is saved and applicant is removed from queue
6. Applicant status is updated and reapplication date set (if rejected)

### 3. Database Migration

Created migration `results/migrations/0002_interviewresult_final_decision_and_more.py`:

- Adds 4 new fields to interview_results table
- Safe to run on existing data (all fields nullable)

## Benefits

### For Recruiters:

1. **Clarity**: Only see applicants that need their attention
2. **No Duplicates**: Once decided, applicants disappear from queue
3. **Efficiency**: No time wasted reviewing already-decided cases
4. **Clear Workflow**: Review → Decide → Move On

### For System:

1. **Better Tracking**: Full audit trail of who decided what and when
2. **Status Management**: Applicant status automatically updates
3. **Reapplication Logic**: Rejected applicants get proper waiting period
4. **Scalability**: Queue size stays manageable as decisions are made

## Score Ranges & Actions

| Score Range | AI Recommendation | HR Action Required  | Auto-Status           |
| ----------- | ----------------- | ------------------- | --------------------- |
| 75-100      | Hire              | Optional review     | Pass (not in queue)   |
| 50-74       | Review            | **Required**        | Pending Review        |
| 40-49       | Reject            | **Optional review** | Needs review          |
| 0-39        | Reject            | None                | Failed (not in queue) |

## API Usage Examples

### Fetch Review Queue

```
GET /api/results/?review_queue=true
```

Returns only results needing HR review (no final decisions, scores 40-75)

### Make Final Decision

```
POST /api/results/{id}/final-decision/
{
  "decision": "hired",  // or "rejected"
  "notes": "Strong technical skills, good culture fit"
}
```

### Filter by Decision Status

```
GET /api/results/?final_decision=pending     // Not yet decided
GET /api/results/?final_decision=decided     // Already decided
GET /api/results/?final_decision=hired       // Hired only
GET /api/results/?final_decision=rejected    // Rejected only
```

## Testing Checklist

- [x] Migration applied successfully
- [ ] Review queue shows only pending reviews
- [ ] Clear passes (75+) not in queue
- [ ] Clear fails (<40) not in queue
- [ ] Hire decision removes from queue
- [ ] Reject decision removes from queue
- [ ] Applicant status updates correctly
- [ ] Reapplication date set for rejections
- [ ] Decision audit trail recorded
- [ ] Back navigation works correctly

## Future Enhancements

1. **Dashboard Metrics**: Show hired vs rejected counts
2. **Decision History**: View all decisions by recruiter
3. **Bulk Actions**: Decide on multiple applicants at once
4. **Email Notifications**: Auto-send decision emails to applicants
5. **Analytics**: Track decision patterns and time-to-decision
6. **Appeal Process**: Allow applicants to request review of rejections

## Notes

- The `showReviewedOnly` toggle was removed as it's no longer needed
- Statistics for "Reviewed Today" is currently set to 0 (requires separate API call)
- Original filtering by position, date range, and priority still works
- All existing functionality (score overrides, comparisons) still available
