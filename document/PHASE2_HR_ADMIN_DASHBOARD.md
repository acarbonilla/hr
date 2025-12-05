# Phase 2: HR Admin Dashboard - Complete Documentation

## Overview

Phase 2 focuses on building a comprehensive HR Admin Dashboard for managing interview results, reviewing applicant performance, overriding AI scores, tracking applicant lifecycle from application to hiring, and implementing geolocation-based application tracking. Additionally, Phase 2 includes advanced interview management features such as dynamic question types, position types, and role-based access control.

**Status:** 14/20 Tasks Completed (70%)  
**Current Date:** November 15, 2025

---

## Completed Features

### 1. HR Admin Authentication ✅

**Purpose:** Secure access to HR dashboard with separate authentication from applicants

**Implementation:**

- **Files:**
  - `frontend/app/hr-login/page.tsx` - HR login interface
  - `frontend/lib/auth-hr.ts` - HR authentication utilities
- **Features:**
  - Separate JWT token storage for HR users (`hr_authToken`, `hr_refreshToken`)
  - Protected routes requiring HR authentication
  - Automatic redirect to login on 401 errors
  - Session persistence using localStorage

**API Endpoints:**

- `POST /api/auth/login/` - HR user login
- `POST /api/auth/logout/` - HR user logout
- `POST /api/auth/refresh/` - Token refresh

**Security:**

- JWT-based authentication
- Token stored in localStorage with `hr_` prefix
- Automatic token refresh on expiration
- Protected API endpoints requiring Bearer token

---

### 2. HR Dashboard Layout ✅

**Purpose:** Main navigation and overview interface for HR users

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/layout.tsx` - Dashboard layout with sidebar navigation
  - `frontend/app/hr-dashboard/page.tsx` - Dashboard home with statistics
- **Features:**
  - Sidebar navigation with active link highlighting
  - Statistics cards showing:
    - Total Applicants (real-time count)
    - Completed Interviews
    - Average AI Score
    - Pass Rate
  - Recent interviews list with quick actions
  - Responsive design with mobile menu toggle

**Navigation Items:**

- 📊 Overview (dashboard home)
- 📋 HR Review Queue (interviews needing review)
- 📝 Interview Results (completed interviews)
- 👥 Applicants (all applicants)
- 📈 Analytics (hiring metrics and trends)
- ❓ Questions (interview question management)
- 💼 Position Types (manage position types)
- 🏷️ Question Types (manage question categories)
- 👤 Users (HR staff management - HR Manager only)
- 🚪 Logout

**Data Sources:**

- `/api/applicants/` - Total applicants count
- `/api/interviews/` - Interview statistics
- `/api/results/` - Results and scores

---

### 3. Interview Results List Page ✅

**Purpose:** View all completed interviews with filtering and status tracking

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/results/page.tsx` - Results list interface
- **Features:**
  - Table view of completed interviews
  - Displays: Applicant name, position, submission date, AI score, status
  - Status badges (Passed/Failed) with color coding
  - Click to view full review
  - Error handling with 401 redirect
  - Loading states

**Status Display Logic:**

- Shows "Passed" (green) or "Failed" (red) when InterviewResult exists
- Shows interview status for incomplete interviews
- Uses `result.passed` field from backend

**Key Improvements:**

- Fixed status display to show passed/failed instead of "completed"
- Added dynamic data fetching from `/api/results/`
- Proper error handling for authentication failures

---

### 4. Full Review Interface ✅

**Purpose:** Comprehensive review of individual interview with all responses

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/results/[id]/review/page.tsx` - Full review page
- **Features:**
  - Applicant information header
  - Overall scores display (AI Score, HR Override, Final Score)
  - Question-by-question breakdown with:
    - Video player for each response
    - Full transcript
    - AI individual score
    - HR override capability
    - AI assessment statement (from LangChain analysis)
  - Score override form with validation
  - Automatic recalculation of final score

**API Endpoint:**

- `GET /api/results/{id}/full-review/` - Returns complete interview data

**Data Structure:**

```json
{
  "result": {
    "id": 1,
    "final_score": 85.5,
    "passed": true
  },
  "applicant": {...},
  "interview": {...},
  "responses": [
    {
      "question": "Tell me about yourself",
      "video_url": "/media/...",
      "transcript": "...",
      "ai_score": 87.0,
      "hr_override_score": null,
      "ai_assessment": "The candidate demonstrates..."
    }
  ]
}
```

**Key Features:**

- AI Assessment statements from LangChain analysis
- Real-time score recalculation after overrides
- Video playback with custom controls
- Proper field mapping (final_score, passed)

---

### 5. Score Override Feature ✅

**Purpose:** Allow HR to override AI scores with justification

**Implementation:**

- **Files:**
  - Integrated into review page (`frontend/app/hr-dashboard/results/[id]/review/page.tsx`)
- **Features:**
  - Score input field (0-100) with validation
  - Comments textarea for justification
  - Submit button with loading state
  - Automatic UI update after override
  - Recalculates overall final score

**API Endpoint:**

- `POST /api/results/{id}/override-score/`
- **Payload:**
  ```json
  {
    "response_id": 123,
    "hr_override_score": 75,
    "hr_comments": "Score adjusted due to..."
  }
  ```

**Score Calculation Logic:**

```python
# Backend: results/views.py
def _recalculate_result_score(result):
    responses = result.interview.video_responses.all()
    scores = []
    for response in responses:
        # Use HR override if available, else AI score
        score = response.hr_override_score if response.hr_override_score is not None else response.ai_score
        if score is not None:
            scores.append(score)

    if scores:
        result.final_score = sum(scores) / len(scores)
        result.passed = result.final_score >= 70
        result.save()
```

**Validation:**

- Score must be 0-100
- Comments required when overriding
- Updates VideoResponse.hr_override_score
- Recalculates InterviewResult.final_score
- Updates passed/failed status

---

### 6. Video Player Component ✅

**Purpose:** Reusable video player for reviewing applicant responses

**Implementation:**

- **Files:**
  - Integrated into review interface
- **Features:**
  - HTML5 video player
  - Custom controls (play/pause, seek, volume)
  - Playback speed control (0.5x, 1x, 1.5x, 2x)
  - Full screen support
  - Progress bar with seek capability
  - Video duration display
  - Responsive design

**Video Sources:**

- Served from `/media/video_responses/`
- WebM format support
- CORS headers configured

---

### 7. Applicant Search and Filtering ✅

**Purpose:** Advanced applicant management with search, filters, and reapplication tracking

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/applicants/page.tsx` - Applicants list with search
- **Features:**
  - **Search:** By name, email, phone, ID
  - **Status Filter:** All, Passed, Failed, In Review, Pending
  - **Pagination:** 10 items per page with smart ellipsis
  - **Reapplication Tracking:**
    - Shows reapplication dates for failed applicants
    - Different waiting periods based on failure type
    - Tooltip with detailed information
  - **Real-time filtering:** Updates as you type
  - **Status badges:** Color-coded for easy identification

**Status Types:**
| Status | Badge Color | Description | Waiting Period |
|--------|-------------|-------------|----------------|
| `pending` | Gray | Just applied | N/A |
| `in_review` | Yellow | Being reviewed | N/A |
| `passed` | Green | Passed - Interview | N/A |
| `failed` | Red | Failed - Interview | 30 days |
| `hired` | Emerald | Successfully hired | N/A |
| `failed_training` | Orange | Failed during training | 90 days |
| `failed_onboarding` | Rose | Failed during onboarding | 180 days |
| `withdrawn` | Slate | Applicant withdrew | N/A |

**Reapplication Logic:**

```typescript
const canReapply = (applicant: Applicant) => {
  if (!applicant.reapplication_date) return null;

  const today = new Date();
  const reapplyDate = new Date(applicant.reapplication_date);
  const isEligible = today >= reapplyDate;

  return { isEligible, date: reapplyDate };
};
```

**Display:**

- If eligible: "✓ Can reapply now" (green badge)
- If not eligible: Shows date in orange badge
- Hover tooltip shows waiting period details

---

## Backend Enhancements

### Applicant Model Updates

**New Fields:**

- `reapplication_date` - Auto-calculated date when applicant can reapply

**Auto-calculation Logic:**

```python
def save(self, *args, **kwargs):
    from datetime import date, timedelta

    failed_statuses = ['failed', 'failed_training', 'failed_onboarding']

    if self.pk:
        old_instance = Applicant.objects.get(pk=self.pk)
        if old_instance.status not in failed_statuses and self.status in failed_statuses:
            if self.status == 'failed':
                self.reapplication_date = date.today() + timedelta(days=30)
            elif self.status == 'failed_training':
                self.reapplication_date = date.today() + timedelta(days=90)
            elif self.status == 'failed_onboarding':
                self.reapplication_date = date.today() + timedelta(days=180)

    super().save(*args, **kwargs)
```

### Serializer Updates

**ApplicantListSerializer:**

- Added `reapplication_date` field
- Now included in API responses

**ApplicantCreateSerializer:**

- Enhanced validation to check reapplication eligibility
- Prevents early reapplication with detailed error messages
- Updates existing record when reapplying after waiting period

**Validation Logic:**

```python
def validate_email(self, value):
    from datetime import date

    existing_applicant = Applicant.objects.filter(email=value).first()

    if existing_applicant:
        if existing_applicant.status == 'failed' and existing_applicant.reapplication_date:
            if date.today() < existing_applicant.reapplication_date:
                days_remaining = (existing_applicant.reapplication_date - date.today()).days
                raise serializers.ValidationError(
                    f"You can reapply after {existing_applicant.reapplication_date.strftime('%B %d, %Y')} "
                    f"({days_remaining} days remaining)."
                )

        if existing_applicant.status in ['pending', 'in_review']:
            raise serializers.ValidationError("Your application is currently being processed.")

        if existing_applicant.status == 'passed':
            raise serializers.ValidationError("You have already passed. Contact HR.")

    return value
```

### Results API Updates

**Fixed Field Mappings:**

- Changed `overall_score` → `final_score`
- Changed `recommendation` → `passed`
- Proper score calculation with HR overrides

**Score Recalculation:**

- Triggered automatically after HR override
- Uses HR score if available, else AI score
- Updates `final_score` and `passed` status

---

### 8. Geolocation-Based Application Tracking ✅

**Purpose:** Automatically detect whether applicants are applying from office vicinity (walk-in) or remotely (online)

**Implementation:**

- **Files:**
  - `backend/applicants/models.py` - Added latitude, longitude, distance_from_office fields
  - `backend/applicants/serializers.py` - Distance calculation and auto-classification
  - `backend/core/geolocation_config.py` - Office coordinates configuration
  - `frontend/lib/geolocation.ts` - Geolocation utility functions
  - `frontend/app/register/page.tsx` - Auto-capture location on registration
  - `frontend/app/hr-dashboard/applicants/page.tsx` - Display source with distance

**Features:**

- **Automatic Detection:** Uses browser Geolocation API to capture coordinates
- **Geofencing:** 500m radius around office determines walk-in vs online
- **Distance Calculation:** Haversine formula calculates exact distance
- **Privacy-Friendly:** Requires user permission, graceful fallback if denied
- **Visual Indicators:**
  - Registration page shows detection status (loading/success/error)
  - HR dashboard displays source with distance badge
- **No External Libraries:** Built-in browser API only

**Technical Details:**

**Backend - Distance Calculation:**

```python
# Haversine formula
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth's radius in meters
    # Calculate distance...
    return distance_in_meters

# Auto-classification
if distance <= 500:  # meters
    application_source = 'walk_in'
else:
    application_source = 'online'
```

**Frontend - Location Capture:**

```typescript
// Get current location
const location = await getCurrentLocation();

// Send with registration
const data = {
  ...formData,
  latitude: location.latitude,
  longitude: location.longitude,
};
```

**Configuration:**

```python
# backend/core/geolocation_config.py
OFFICE_COORDINATES = {
    'latitude': 14.5995,   # Manila, Philippines (example)
    'longitude': 120.9842,
    'name': 'Head Office',
}
GEOFENCE_RADIUS_METERS = 500  # 500 meters
```

**Database Schema:**

```sql
ALTER TABLE applicants ADD COLUMN latitude DECIMAL(9,6);
ALTER TABLE applicants ADD COLUMN longitude DECIMAL(9,6);
ALTER TABLE applicants ADD COLUMN distance_from_office DECIMAL(10,2);
```

**HR Dashboard Display:**

- New "Source" column in applicants table
- Shows "Walk-in (250m)" or "Online (5.3km)"
- Color-coded badges: Blue for Walk-in, Gray for Online
- Helps HR verify physical presence vs remote application

**Use Cases:**

1. **Walk-in Verification:** Confirm applicants physically visited office
2. **Application Analytics:** Track walk-in vs online application rates
3. **Fraud Prevention:** Detect false walk-in claims
4. **Branch Attribution:** (Future) Assign to nearest office location

**Privacy & Security:**

- Only captures location at registration time
- Requires explicit browser permission
- User can deny - still allows registration
- Location used only for classification
- Coordinates stored for verification only

**Accuracy:**

- GPS: 10-50 meters (outdoor)
- Wi-Fi Assisted: 50-500 meters (indoor)
- Mobile devices typically more accurate than desktop

**Configuration Guide:**
See detailed documentation in `document/GEOLOCATION_TRACKING.md`

---

### 9. Interview Questions Management ✅

**Purpose:** Manage interview questions with dynamic position and question types

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/questions/page.tsx` - Questions management interface
  - `backend/interviews/models.py` - InterviewQuestion model with ForeignKeys
  - `backend/interviews/views.py` - InterviewQuestionViewSet (ModelViewSet)
  - `backend/interviews/serializers.py` - InterviewQuestionSerializer with nested types
- **Features:**
  - View all interview questions with pagination (10/20/50/100 items per page)
  - Add/Edit/Delete questions
  - Filter by Position Type and Question Type
  - Search questions by text
  - Automatic display order assignment
  - Statistics cards showing question counts by type
  - Dynamic type selection from database (not hardcoded)

**Database Schema Changes:**

- Converted `question_type` and `position_type` from CharField to ForeignKey
- Migration handles data transfer from old string values to new foreign keys
- Preserves existing question data during migration

**Key Features:**

- **Dynamic Filtering:** Filter dropdowns populated from database types
- **Automatic Ordering:** Display order calculated automatically (prevents duplicates)
- **Full CRUD:** Create, Read, Update, Delete operations supported
- **Type Safety:** Foreign key relationships ensure data integrity
- **Pagination:** Smart pagination with page number buttons and ellipsis

---

### 10. Position Types Management ✅

**Purpose:** Manage position types dynamically (replaces hardcoded values)

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/position-types/page.tsx` - Position types management
  - `backend/interviews/type_models.py` - PositionType model
  - `backend/interviews/views.py` - PositionTypeViewSet
  - `backend/interviews/type_serializers.py` - PositionTypeSerializer
- **Features:**
  - View all position types with pagination (10/20/50/100)
  - Add/Edit/Delete position types
  - Toggle active/inactive status
  - Automatic order assignment
  - Code auto-formatting (lowercase with underscores)
  - Statistics: Total types, Active count, Inactive count

**Model Structure:**

```python
class PositionType(models.Model):
    code = models.CharField(max_length=50, unique=True)  # e.g., "virtual_assistant"
    name = models.CharField(max_length=100)  # e.g., "Virtual Assistant"
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Key Features:**

- **Dynamic Management:** Add new position types without code changes
- **Active Control:** Enable/disable types without deletion
- **Ordering:** Control display order in forms
- **Purple/Pink Theme:** Consistent color scheme throughout

---

### 11. Question Types Management ✅

**Purpose:** Manage question categories dynamically (Technical, Behavioral, etc.)

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/question-types/page.tsx` - Question types management
  - `backend/interviews/type_models.py` - QuestionType model
  - `backend/interviews/views.py` - QuestionTypeViewSet
  - `backend/interviews/type_serializers.py` - QuestionTypeSerializer
- **Features:**
  - View all question types with pagination (10/20/50/100)
  - Add/Edit/Delete question types
  - Toggle active/inactive status
  - Automatic order assignment
  - Code auto-formatting (lowercase with underscores)
  - Statistics: Total types, Active count, Inactive count

**Default Question Types:**

- General - General questions for all positions
- Technical - Technical skills and knowledge
- Behavioral - Past behavior and experiences
- Situational - Hypothetical scenarios

**Key Features:**

- **Extensible:** Add custom question categories
- **Filtering:** Used in questions page for filtering
- **Integration:** Automatically appears in question form dropdowns
- **Blue/Cyan Theme:** Distinct color scheme from position types

---

### 12. Role-Based Access Control ✅

**Purpose:** Restrict sensitive features to HR Managers only

**Implementation:**

- **Files:**
  - `frontend/lib/auth-hr.ts` - isHRManager() function
  - `frontend/app/hr-dashboard/layout.tsx` - Conditional navigation rendering
  - `frontend/app/hr-dashboard/users/page.tsx` - Protected users page
- **Features:**
  - Users page only visible to HR Managers in navigation
  - Automatic redirect for non-managers trying to access Users page
  - Role checking: `hr_admin`, `hr_manager`, `system_admin`
  - Protected page shows access requirements clearly

**Authorized Roles:**

- ✅ **HR Manager** - Full user management access
- ✅ **HR Admin** - Full user management access
- ✅ **System Admin** - Full user management access
- ❌ **Recruiter** - Cannot access user management
- ❌ **HR Staff** - Cannot access user management

**Security Implementation:**

```typescript
// Check if user has manager privileges
export function isHRManager(): boolean {
  const user = getHRUser();
  if (!user) return false;

  const managerRoles = ["hr_admin", "hr_manager", "system_admin"];
  return managerRoles.includes(user.user_type) || managerRoles.includes(user.role || "");
}
```

**User Interface:**

- Non-managers don't see "Users" menu item
- Direct URL access redirects to dashboard
- Clear messaging about access requirements
- Lists authorized roles on protected page

---

## Key Bug Fixes & Improvements

### 1. Static Dashboard Data

**Problem:** Dashboard showed placeholder data  
**Solution:** Implemented dynamic data fetching from APIs

### 2. Wrong Status Display

**Problem:** Showing "completed" instead of "passed/failed"  
**Solution:** Changed logic to display `result.passed` status

### 3. 401 Authentication Errors

**Problem:** Pages crashing when not logged in  
**Solution:** Added error handling with auto-redirect

### 4. View All Navigation

**Problem:** "View All" went to results instead of interviews  
**Solution:** Created `/hr-dashboard/interviews` page

### 5. Missing Reapplication Date in API

**Problem:** `reapplication_date` not in API response  
**Solution:** Added field to `ApplicantListSerializer`

### 6. AI Assessment Missing

**Problem:** No AI assessment statements shown  
**Solution:** Added `ai_assessment` from LangChain analysis

### 7. Score Calculation Errors

**Problem:** Final score not updated after override  
**Solution:** Implemented `_recalculate_result_score()` function

### 8. Question Type/Position Type "Unknown" Display

**Problem:** After editing questions, type fields showed "Unknown"  
**Solution:** Updated formatting functions to handle numeric IDs by looking up in type arrays

### 9. Questions Filter Not Working

**Problem:** Filtering by position/question type returned no results  
**Solution:**

- Changed filter dropdowns from hardcoded values to dynamic database types
- Updated filter logic to handle numeric IDs and look them up properly
- Added positionTypes and questionTypes as dependencies to useEffect

### 10. Migration Conflict

**Problem:** Multiple leaf migrations causing conflict  
**Solution:** Created complex 7-step data migration to safely convert CharField to ForeignKey while preserving data

### 11. Display Order Duplicates

**Problem:** Users could enter duplicate order numbers causing confusion  
**Solution:** Removed manual order input, implemented automatic order calculation (max + 1)

---

## API Endpoints Summary

### Authentication

- `POST /api/auth/login/` - HR login
- `POST /api/auth/logout/` - HR logout
- `POST /api/auth/refresh/` - Token refresh

### Applicants

- `GET /api/applicants/` - List all applicants
  - Query params: `status`, `source`, `search`
  - Returns: applicant data including location fields
- `GET /api/applicants/{id}/` - Get applicant details
- `POST /api/applicants/` - Create new applicant (with validation and geolocation)
  - Accepts: `latitude`, `longitude` (optional)
  - Auto-calculates: `distance_from_office`, `application_source`
- `PATCH /api/applicants/{id}/` - Update applicant status

### Interviews

- `GET /api/interviews/` - List all interviews
- `GET /api/interviews/{id}/` - Get interview details

### Questions Management

- `GET /api/questions/` - List all interview questions
  - Supports pagination: `?page_size=1000`
  - Returns: Nested type details (question_type_detail, position_type_detail)
- `GET /api/questions/{id}/` - Get specific question
- `POST /api/questions/` - Create new question
  - Required: `question_text`, `question_type_id`, `position_type_id`, `order`
- `PATCH /api/questions/{id}/` - Update question
- `DELETE /api/questions/{id}/` - Delete question

### Position Types Management

- `GET /api/position-types/` - List all position types
  - Returns: All fields including is_active status
- `GET /api/position-types/{id}/` - Get specific position type
- `POST /api/position-types/` - Create new position type
  - Required: `code`, `name`, `order`
  - Optional: `description`, `is_active` (default: true)
- `PATCH /api/position-types/{id}/` - Update position type
- `DELETE /api/position-types/{id}/` - Delete position type (protected if in use)

### Question Types Management

- `GET /api/question-types/` - List all question types
  - Returns: All fields including is_active status
- `GET /api/question-types/{id}/` - Get specific question type
- `POST /api/question-types/` - Create new question type
  - Required: `code`, `name`, `order`
  - Optional: `description`, `is_active` (default: true)
- `PATCH /api/question-types/{id}/` - Update question type
- `DELETE /api/question-types/{id}/` - Delete question type (protected if in use)

### Results

- `GET /api/results/` - List completed interview results
- `GET /api/results/{id}/` - Get specific result
- `GET /api/results/{id}/full-review/` - Full review data
- `POST /api/results/{id}/override-score/` - Override AI score

**Example API Response with Geolocation:**

```json
// POST /api/applicants/
Request:
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "latitude": 14.5990,
  "longitude": 120.9850
}

Response:
{
  "id": 25,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "application_source": "walk_in",
  "status": "pending",
  "latitude": 14.5990,
  "longitude": 120.9850,
  "distance_from_office": 235.50,
  "application_date": "2025-11-14T10:30:00Z"
}
```

---

## Data Flow Diagrams

### Score Override Flow

```
1. HR views review page
   ↓
2. GET /api/results/{id}/full-review/
   ↓
3. Display responses with AI scores
   ↓
4. HR enters override score + comments
   ↓
5. POST /api/results/{id}/override-score/
   {
     response_id: 123,
     hr_override_score: 75,
     hr_comments: "..."
   }
   ↓
6. Backend updates VideoResponse.hr_override_score
   ↓
7. Backend recalculates InterviewResult.final_score
   ↓
8. Frontend refreshes data
   ↓
9. Display updated scores
```

### Reapplication Validation Flow

```
1. Applicant submits application
   ↓
2. POST /api/applicants/
   {
     email: "user@example.com",
     ...
   }
   ↓
3. Serializer checks existing applicant
   ↓
4. If failed status:
   - Check reapplication_date
   - If today < reapplication_date:
     → Reject with error message
   - If today >= reapplication_date:
     → Update existing record
   ↓
5. If pending/in_review:
   → Reject (already processing)
   ↓
6. If passed:
   → Reject (already successful)
   ↓
7. If new email:
   → Create new applicant
```

### Geolocation Detection Flow

```
1. Applicant opens registration page
   ↓
2. Browser requests location permission
   ↓
3. If permission granted:
   - Get latitude/longitude from GPS/Wi-Fi
   - Display "Location detected successfully"
   If permission denied:
   - Show warning message
   - Continue without location
   ↓
4. Applicant submits form
   ↓
5. POST /api/applicants/ with location data
   {
     first_name, last_name, email, phone,
     latitude: 14.5990,
     longitude: 120.9850
   }
   ↓
6. Backend calculates distance using Haversine:
   distance = calculate_distance(
     applicant_coords,
     office_coords
   )
   ↓
7. Auto-classify application source:
   - If distance <= 500m: application_source = 'walk_in'
   - If distance > 500m: application_source = 'online'
   ↓
8. Store in database:
   - latitude, longitude
   - distance_from_office
   - application_source (auto-set)
   ↓
9. HR Dashboard displays:
   - "Walk-in (235m)" or "Online (5.3km)"
   - Color-coded badge
```

---

### 13. AI vs HR Score Comparison ✅

**Purpose:** Analyze agreement between AI assessments and HR reviews

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/ai-comparison/page.tsx` - Comparison analysis page
- **Features:**
  - Side-by-side score comparison table
  - Statistical analysis (agreement rate, deviation metrics)
  - Visual charts showing score distributions
  - Filter by score change type (HR higher, AI higher, same)
  - Sort by deviation or date
  - Color-coded score badges and change indicators
- **Metrics Displayed:**
  - Total overrides
  - Agreement rate (percentage of exact matches)
  - Average deviation between AI and HR scores
  - Score increase/decrease breakdown
  - Detailed response-level comparisons

**Navigation:** Added to main HR Dashboard menu as "AI vs HR Comparison" ⚖️

---

### 14. Advanced Analytics Dashboard ✅

**Purpose:** Comprehensive hiring metrics with visual charts and insights

**Implementation:**

- **Files:**
  - `frontend/app/hr-dashboard/analytics/page.tsx` - Enhanced analytics page
- **Enhanced Features:**
  - **Key Metrics Cards:** Total applicants, interviews, pass rate, average score
  - **Status Breakdown Chart:** Horizontal bar chart showing applicant status distribution
  - **Position Distribution:** Position-based interview statistics with average scores
  - **Score Distribution Histogram:** Visual distribution of scores across 5 buckets (0-20, 21-40, 41-60, 61-80, 81-100)
  - **Recent Activity Timeline:** 7-day trend of applicants, interviews, and results
  - **HR Review Progress:** Reviewed vs pending count with progress bar
  - **Hiring Funnel:** Applied → Interviewed → Passed → Hired conversion metrics
- **Period Filtering:** 7d, 30d, 90d, All Time
- **Interactive Charts:** Hover effects, tooltips, animated transitions

**Visual Enhancements:**

- Gradient backgrounds for cards
- Color-coded metrics (green for positive, red for negative)
- Responsive bar charts with percentages
- Animated progress bars

---

## Pending Features (6/20)

### High Priority

1. **Export/Download Results** - CSV/PDF export functionality

### Medium Priority

4. **HR User Management** - Manage HR accounts
5. **Real-time Notifications** - Alert on new interviews
6. **Interview Resubmission** - Allow retakes
7. **Bulk Actions** - Batch operations
8. **Audit Log** - Track HR actions

### Low Priority

9. **Transcript Viewer** - Enhanced transcript display
10. **Mobile Responsive** - Mobile optimization
11. **Loading States** - Skeleton screens
12. **Date Range Filtering** - Filter by date ranges
13. **Question Bank Management** - Manage interview questions

---

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Geolocation Configuration

Update office coordinates in `backend/core/geolocation_config.py`:

```python
OFFICE_COORDINATES = {
    'latitude': 14.5995,   # Your office latitude
    'longitude': 120.9842,  # Your office longitude
    'name': 'Head Office',
}

GEOFENCE_RADIUS_METERS = 500  # 500 meters (0.5 km)
```

**How to get your office coordinates:**

1. Open Google Maps
2. Find your office location
3. Right-click → "What's here?"
4. Copy latitude/longitude (e.g., 14.5995, 120.9842)

### Required Packages

**Backend:**

```
Django==5.1.3
djangorestframework
djangorestframework-simplejwt
django-cors-headers
```

**Frontend:**

```
next@16.0.1
react
typescript
axios
tailwindcss
```

---

## Testing

### Test Accounts

- **HR Admin:** `hr@example.com` / password
- **Test Applicant:** Aaron Maybe (ID: 25) - Failed status with reapplication date

### Test Scenarios

**1. HR Login:**

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"hr@example.com","password":"password"}'
```

**2. Get Applicants:**

```bash
curl http://localhost:8000/api/applicants/ \
  -H "Authorization: Bearer {token}"
```

**3. Override Score:**

```bash
curl -X POST http://localhost:8000/api/results/1/override-score/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"response_id":1,"hr_override_score":85,"hr_comments":"Good answer"}'
```

**4. Test Reapplication Validation:**

```bash
# Should fail if within 30 days
curl -X POST http://localhost:8000/api/applicants/ \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Aaron","last_name":"Maybe","email":"am@gm.com","phone":"+123","application_source":"online"}'
```

---

## Database Schema

### Applicant Model

```sql
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(254) UNIQUE,
    phone VARCHAR(20),
    application_source VARCHAR(10),
    status VARCHAR(20),
    application_date TIMESTAMP,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    distance_from_office DECIMAL(10,2),
    reapplication_date DATE NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### InterviewResult Model

```sql
CREATE TABLE interview_results (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id),
    final_score DECIMAL(5,2),
    passed BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### VideoResponse Model

```sql
CREATE TABLE video_responses (
    id SERIAL PRIMARY KEY,
    interview_id INTEGER REFERENCES interviews(id),
    question_id INTEGER REFERENCES questions(id),
    video_file VARCHAR(255),
    transcript TEXT,
    ai_score DECIMAL(5,2),
    hr_override_score DECIMAL(5,2) NULL,
    hr_comments TEXT NULL,
    ai_assessment TEXT NULL,
    created_at TIMESTAMP
);
```

---

## UI Components

### Color Scheme

**Status Colors:**

- Passed: `bg-green-100 text-green-800`
- Failed: `bg-red-100 text-red-800`
- In Review: `bg-yellow-100 text-yellow-800`
- Pending: `bg-gray-100 text-gray-800`
- Hired: `bg-emerald-100 text-emerald-800`
- Failed Training: `bg-orange-100 text-orange-800`
- Failed Onboarding: `bg-rose-100 text-rose-800`
- Withdrawn: `bg-slate-100 text-slate-800`

**Action Colors:**

- Primary: Purple (`#7C3AED`)
- Success: Green (`#10B981`)
- Warning: Orange (`#F59E0B`)
- Danger: Red (`#EF4444`)

### Typography

- Headings: Font weight 600-700
- Body: Font weight 400
- Labels: Font weight 500
- Small text: 12px-14px
- Body text: 14px-16px
- Headings: 18px-24px

---

## Performance Optimizations

1. **Pagination:** 10 items per page for large lists
2. **API Caching:** Revalidate data on mutations
3. **Lazy Loading:** Video players load on demand
4. **Debounced Search:** 300ms delay on search input
5. **Optimistic Updates:** UI updates before API confirmation

---

## Security Considerations

1. **JWT Authentication:** All HR endpoints protected
2. **Token Storage:** LocalStorage with `hr_` prefix
3. **CORS:** Configured for frontend origin
4. **Input Validation:** All forms validated on backend
5. **SQL Injection Prevention:** Using Django ORM
6. **XSS Prevention:** React automatic escaping

---

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure production database
- [ ] Set up CORS for production domain
- [ ] Configure media file serving (AWS S3/CloudFront)
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Configure JWT token expiration
- [ ] Set up logging and monitoring
- [ ] Create HR admin accounts
- [ ] Test all features in production

---

## Troubleshooting

### Common Issues

**1. 401 Unauthorized Errors**

- Check if HR token is valid
- Verify token in localStorage
- Try logging in again

**2. Reapplication Date Not Showing**

- Verify `reapplication_date` in serializer fields
- Check migration applied
- Refresh API data

**3. Score Override Not Working**

- Verify response_id is correct
- Check hr_override_score field exists
- Ensure proper permissions

**4. Video Not Playing**

- Check video file exists in media folder
- Verify CORS headers
- Check video format (WebM supported)

---

## Future Enhancements

1. **Real-time Updates:** WebSocket for live notifications
2. **Advanced Analytics:** Charts and graphs for trends
3. **Bulk Operations:** Multi-select and batch actions
4. **Email Notifications:** Automated emails to applicants
5. **Calendar Integration:** Schedule follow-up interviews
6. **Document Management:** Upload and review resumes
7. **Interview Scheduling:** Built-in scheduling system
8. **Performance Metrics:** Track HR review efficiency
9. **Mobile App:** Native mobile interface
10. **AI Training:** Improve AI model with HR feedback

---

## Contributors & Changelog

**Version 1.0** - November 14, 2025

- Initial Phase 2 implementation
- 7/20 features completed
- Reapplication tracking system
- Score override functionality
- AI assessment integration

**Version 1.1** - November 15, 2025

- Advanced features implementation
- 12/20 features completed (60% progress)
- Dynamic question management system
- Position and question types management
- Role-based access control
- Pagination across all management pages
- Migration from hardcoded to database-driven types
- Automatic order assignment for all resources
- Enhanced filtering with dynamic type selection

**Version 1.2** - November 15, 2025

- Advanced analytics and comparison features
- 14/20 features completed (70% progress)
- AI vs HR Score Comparison page with detailed analysis
- Enhanced Analytics Dashboard with visual charts
- Score distribution histogram (5 buckets)
- HR review progress tracking
- Hiring funnel metrics
- Activity trend visualization (7-day timeline)
- Interactive charts with hover effects and animations
- Statistical analysis (agreement rate, deviation, conversion rates)

**Version 1.3** - November 15, 2025

- Intelligent scoring and review recommendation system
- Enhanced pending review logic
- Three-tier recommendation system implementation

---

## Scoring Thresholds & Recommendation System

### Automatic Recommendation Logic

The system automatically categorizes interview results into three tiers based on performance scores:

**Scoring Breakdown:**

| Score Range | Recommendation  | Badge  | Description                                      |
| ----------- | --------------- | ------ | ------------------------------------------------ |
| **75-100**  | 🟢 Hire         | Green  | Strong performance - Auto-approve for next stage |
| **50-74.9** | 🟡 Needs Review | Yellow | Borderline performance - Requires HR evaluation  |
| **0-49**    | 🔴 Reject       | Red    | Weak performance - Auto-reject                   |

### Pending Reviews Logic

Results appear in the "Pending Reviews" queue if they meet ANY of these criteria:

1. **Recommendation = "review"** (score 50-74.9)

   - Borderline candidates that need HR judgment
   - Neither clear pass nor clear fail

2. **Not yet reviewed by HR** (`hr_reviewed_at` is null)
   - New results awaiting HR attention
   - Includes all recommendations (hire, review, reject)

### Implementation Details

**Backend:**

- `backend/results/serializers.py` - `InterviewResultListSerializer.get_recommendation()`
- Calculates recommendation based on `final_score` field
- Returns 'hire', 'review', or 'reject'

**Frontend:**

- `frontend/app/hr-dashboard/page.tsx` - Dashboard pending count
- `frontend/app/hr-dashboard/interviews/page.tsx` - Review queue filtering
- Filters: `r.recommendation === 'review' || !r.hr_reviewed_at`

**Configuration:**

Thresholds can be adjusted in `backend/results/serializers.py`:

```python
def get_recommendation(self, obj):
    if obj.final_score >= 75:
        return 'hire'
    elif 50 <= obj.final_score < 75:
        return 'review'
    else:
        return 'reject'
```

### Benefits of This System

1. **Efficient HR Time Management**

   - Focus on borderline cases (50-74.9)
   - Auto-approve strong performers (75+)
   - Auto-reject weak performers (<50)

2. **Consistent Decision Making**

   - Clear criteria for all stakeholders
   - Reduces subjective bias
   - Standardized evaluation process

3. **Quality Control**

   - HR reviews borderline cases before final decision
   - Prevents premature rejections of potential candidates
   - Ensures strong candidates aren't overlooked

4. **Transparency**
   - Clear visibility of review status
   - Easy to track which results need attention
   - Audit trail with `hr_reviewed_at` timestamps

---

## Applicant Reapplication System ✅

**Purpose:** Allow applicants to reapply after their waiting period expires, with automatic validation and record management.

**Status:** Completed - November 16, 2025

### Overview

The reapplication system enables applicants to register again after failing or passing interviews, subject to mandatory waiting periods. The system automatically handles validation during registration without requiring HR intervention.

### Waiting Periods

| Status                 | Waiting Period      | Reason                                    |
| ---------------------- | ------------------- | ----------------------------------------- |
| **Failed** (Interview) | 30 days             | Give applicant time to improve skills     |
| **Passed** (Interview) | 180 days (6 months) | If not hired, allow them to reapply later |
| **Failed Training**    | 90 days             | Give more time to prepare for training    |
| **Failed Onboarding**  | 180 days (6 months) | Significant time needed before retry      |

### Implementation Details

**Backend Files:**

- `backend/applicants/serializers.py` - Validation logic and reapplication handling
- `backend/applicants/models.py` - Automatic reapplication_date setting

**Key Features:**

1. **Automatic Date Setting**

   - When applicant status changes to failed/passed/failed_training/failed_onboarding
   - `reapplication_date` automatically set based on status type
   - Implemented in `Applicant.save()` method

2. **Registration Validation**

   - Email uniqueness check with reapplication logic
   - Custom validation in `ApplicantCreateSerializer.validate_email()`
   - Clear error messages with exact dates

3. **Record Management**
   - Updates existing applicant record (preserves ID)
   - Maintains interview history and relationships
   - Status reset to "Pending"
   - Reapplication date cleared
   - Application date updated to current timestamp

### Validation Logic

#### ✅ ALLOWED TO REAPPLY:

When email exists and reapplication date has passed:

- System updates the existing applicant record
- Status → "Pending"
- Reapplication date → Cleared (None)
- Application date → Current timestamp
- Applicant ID → **Preserved** (maintains history)

#### ❌ BLOCKED FROM REAPPLICATION:

1. **Waiting Period Not Expired**

   ```
   Error: "You can reapply after December 15, 2025
   (29 days remaining after interview failure).
   Please wait until the reapplication period ends."
   ```

2. **Application In Progress** (Status: Pending or In Review)

   ```
   Error: "Your application is currently being processed.
   Please wait for the result."
   ```

3. **Already Hired**
   ```
   Error: "You are already hired.
   Please contact HR if you have any questions."
   ```

### Frontend Experience

**Applicants Table** (`frontend/app/hr-dashboard/applicants/page.tsx`)

Simplified table showing essential information:

| Column        | Description                     |
| ------------- | ------------------------------- |
| Name          | Applicant name with ID          |
| Position      | Position applied for            |
| Result        | ✓ Pass / ⚠ Review / ✗ Failed    |
| HR Review     | Auto / Needs Review / Reviewed  |
| Reapplication | Date or "Can reapply now" badge |
| Actions       | Edit button                     |

**Reapplication Status Display:**

- 🟢 "Can reapply now" - Eligibility date has passed
- 🟠 "December 15, 2025" - Shows when they can reapply
- Tooltip shows reason (e.g., "30 days after interview failure")

### Code Implementation

**Backend Validation:**

```python
def validate_email(self, value):
    """Check if applicant can reapply based on status and date"""
    existing_applicant = Applicant.objects.filter(email=value).first()

    if existing_applicant:
        reapplication_statuses = ['failed', 'passed', 'failed_training', 'failed_onboarding']

        if existing_applicant.status in reapplication_statuses:
            if existing_applicant.reapplication_date:
                if date.today() < existing_applicant.reapplication_date:
                    # Block: Show error with date
                    days_remaining = (existing_applicant.reapplication_date - date.today()).days
                    raise serializers.ValidationError(
                        f"You can reapply after {existing_applicant.reapplication_date.strftime('%B %d, %Y')} "
                        f"({days_remaining} days remaining...)"
                    )
                # Allow: Reapplication date has passed
                return value
```

**Record Update on Reapplication:**

```python
def create(self, validated_data):
    """Create or update applicant for reapplication"""
    existing_applicant = Applicant.objects.filter(email=email).first()

    if existing_applicant and existing_applicant.status in reapplication_statuses:
        if existing_applicant.reapplication_date and date.today() >= existing_applicant.reapplication_date:
            # Update existing record
            for key, value in validated_data.items():
                setattr(existing_applicant, key, value)
            existing_applicant.status = 'pending'
            existing_applicant.reapplication_date = None
            existing_applicant.application_date = timezone.now()
            existing_applicant.save()
            return existing_applicant
```

### Benefits

1. **No Manual Intervention** - System handles reapplication automatically
2. **Clear Communication** - Applicants see exact date they can reapply
3. **Preserves History** - All previous attempts and results remain in database
4. **Fair Process** - Consistent waiting periods based on failure reason
5. **Simple for HR** - Just monitor the applicants table
6. **Flexible** - Can adjust waiting periods in model constants

### Testing

**Test Scripts:**

- `backend/test_reapplication.py` - Check current reapplication eligibility
- `backend/test_reapplication_flow.py` - Test reapplication validation logic

**Test Coverage:**

- ✅ Blocks reapplication during waiting period
- ✅ Allows reapplication after waiting period expires
- ✅ Handles all status types correctly
- ✅ Blocks active statuses (pending, in_review, hired)
- ✅ Shows correct error messages
- ✅ Preserves applicant ID and history

### Example Scenarios

**Scenario 1: Failed Interview (30 days)**

- John Travolta fails interview on Nov 16, 2025
- Reapplication date: Dec 15, 2025
- If tries to register on Nov 20: ❌ Blocked with date
- If tries to register on Dec 16: ✅ Allowed to reapply

**Scenario 2: Passed Interview (180 days)**

- Lebron James passes interview on Nov 16, 2025
- Reapplication date: May 15, 2026
- Reason: If not hired, can apply again after 6 months
- If tries before May 15: ❌ Blocked
- If tries after May 15: ✅ Allowed

**Scenario 3: Failed Training (90 days)**

- Red Rose fails training on Nov 16, 2025
- Reapplication date: Feb 14, 2026
- Needs more time to prepare for training
- If tries before Feb 14: ❌ Blocked
- If tries after Feb 14: ✅ Allowed

### Future Enhancements (Optional)

1. **Email Notification** - Send email when waiting period ends
2. **Dashboard Widget** - Show "X applicants eligible to reapply today"
3. **Analytics** - Track reapplication success rates
4. **Variable Waiting Periods** - Allow HR to adjust per applicant
5. **Reapplication History** - Add dedicated view showing all attempts

**Documentation:** See `/document/REAPPLICATION_SYSTEM.md` for complete details.

---

## Support & Resources

**Documentation:**

- API Documentation: `/document/API_ROADMAP.md`
- Authentication Guide: `/document/AUTHENTICATION_API.md`
- Backend Setup: `/document/BACKEND_SETUP.md`
- Geolocation Tracking: `/document/GEOLOCATION_TRACKING.md`
- Reapplication System: `/document/REAPPLICATION_SYSTEM.md`

**Contact:**

- Project Lead: [Your Name]
- Email: [Your Email]
- Repository: [GitHub URL]

---

_Last Updated: November 16, 2025_
