# HireNowPro - API Development & Implementation Roadmap

## 📊 Complete API Endpoints Overview

### **Total API Endpoints: 46**

Broken down by application and implementation phases.

---

## 🎯 Phase 1: MVP (Minimum Viable Product) - 4 Core APIs

### Goal: Create a working end-to-end flow from applicant registration to results

#### 1. Applicant Registration API

**Endpoint**: `POST /api/applicants/`

- **Purpose**: Create new applicant (walk-in or online)
- **Request Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "application_source": "online"
  }
  ```
- **Response**: Applicant object with ID
- **Files to Create**:
  - `applicants/serializers.py`
  - `applicants/views.py`
  - `applicants/urls.py`

#### 2. Interview Management API

**Endpoint**: `POST /api/interviews/`

- **Purpose**: Start a new interview for an applicant
- **Request Body**:
  ```json
  {
    "applicant": 1,
    "interview_type": "initial_ai"
  }
  ```
- **Response**: Interview object with questions
- **Auto-creates**: ProcessingQueue entry

#### 3. Video Upload API

**Endpoint**: `POST /api/interviews/{id}/video-response/`

- **Purpose**: Upload video response for a question
- **Request**: Multipart form-data with video file
- **Triggers**: Celery task for AI analysis
- **Files to Create**:
  - `interviews/serializers.py`
  - `interviews/views.py`
  - `interviews/urls.py`

#### 4. Results Retrieval API

**Endpoint**: `GET /api/interviews/{id}/analysis/`

- **Purpose**: Get AI analysis and final results
- **Response**: Complete analysis with scores and recommendation
- **Related**: Auto-creates InterviewResult entry

---

## 📈 Phase 2: Core Features - 15 Additional Endpoints

### Authentication & User Management (8 endpoints)

#### Authentication Flow

1. `POST /api/auth/register/` - User registration
2. `POST /api/auth/login/` - Login and get JWT tokens
3. `POST /api/auth/token/refresh/` - Refresh access token
4. `POST /api/auth/logout/` - Logout and blacklist token
5. `GET /api/auth/me/` - Get current user profile
6. `PUT /api/auth/me/` - Update user profile

**Files to Create**:

- `accounts/serializers.py`
- `accounts/views.py`
- `accounts/urls.py`

#### User Management (Admin only)

7. `GET /api/users/` - List all users
8. `GET /api/users/{id}/` - Get user details

### Applicant Management (7 endpoints)

9. `GET /api/applicants/` - List all applicants with filters
   - Query params: `?status=pending&source=online`
10. `GET /api/applicants/{id}/` - Get applicant details
11. `PUT /api/applicants/{id}/` - Update applicant
12. `PATCH /api/applicants/{id}/` - Partial update
13. `DELETE /api/applicants/{id}/` - Delete applicant
14. `POST /api/applicants/{id}/documents/` - Upload document
15. `GET /api/applicants/{id}/documents/` - List applicant documents

---

## 🔧 Phase 3: Advanced Features - 12 Endpoints

### Interview Question Management (4 endpoints)

16. `GET /api/questions/` - List all interview questions
    - Filter by: `?type=technical&is_active=true`
17. `GET /api/questions/{id}/` - Get question details
18. `POST /api/questions/` - Create new question (admin)
19. `PUT /api/questions/{id}/` - Update question (admin)

### Advanced Interview Operations (8 endpoints)

20. `GET /api/interviews/` - List all interviews with filters
    - Filter by: `?applicant=1&status=completed`
21. `GET /api/interviews/{id}/` - Get interview details
22. `PATCH /api/interviews/{id}/` - Update interview status
23. `GET /api/interviews/{id}/video-responses/` - List all video responses
24. `GET /api/video-responses/{id}/` - Get specific video response
25. `GET /api/video-responses/{id}/analysis/` - Get AI analysis for video
26. `POST /api/interviews/{id}/submit/` - Submit completed interview
27. `GET /api/interviews/{id}/progress/` - Get interview completion progress

---

## ⚙️ Phase 4: Processing & Notifications - 10 Endpoints

### Processing Queue Management (4 endpoints)

28. `GET /api/processing-queue/` - List all queue items
    - Filter by: `?status=processing`
29. `GET /api/processing-queue/{id}/` - Get queue item status
30. `GET /api/processing-queue/{id}/logs/` - Get processing logs
31. `POST /api/processing-queue/{id}/retry/` - Retry failed processing

### Notification System (6 endpoints)

32. `GET /api/notifications/` - List notifications
    - Filter by: `?applicant=1&status=sent`
33. `GET /api/notifications/{id}/` - Get notification details
34. `POST /api/notifications/send/` - Send notification manually
35. `GET /api/email-templates/` - List all email templates
36. `POST /api/email-templates/` - Create email template (admin)
37. `PUT /api/email-templates/{id}/` - Update email template (admin)

**Files to Create**:

- `processing/serializers.py`
- `processing/views.py`
- `processing/urls.py`
- `notifications/serializers.py`
- `notifications/views.py`
- `notifications/urls.py`

---

## 📊 Phase 5: Results & Analytics - 8 Endpoints

### Results Management (5 endpoints)

38. `GET /api/results/` - List all interview results
    - Filter by: `?passed=true&date_from=2025-01-01`
39. `GET /api/results/{id}/` - Get specific result details
40. `GET /api/results/applicant/{applicant_id}/` - Get all results for applicant
41. `PATCH /api/results/{id}/display/` - Mark result as displayed in HR portal
42. `POST /api/results/{id}/send-notification/` - Send result notification

### Reapplication & Reports (3 endpoints)

43. `GET /api/reapplication-tracking/` - List reapplication tracking
44. `GET /api/reapplication-tracking/{applicant_id}/` - Check reapplication eligibility
45. `GET /api/reports/statistics/` - Get system statistics
    ```json
    {
      "total_applicants": 150,
      "interviews_completed": 120,
      "pass_rate": 75.5,
      "avg_processing_time": "8.5 minutes"
    }
    ```
46. `GET /api/reports/export/` - Export results (CSV/Excel)
    - Query params: `?format=csv&date_from=2025-01-01`

**Files to Create**:

- `results/serializers.py`
- `results/views.py`
- `results/urls.py`

---

## 🔄 Option 2: Celery Tasks Implementation

### Async Processing Tasks to Build

#### 1. Video Processing Task

**File**: `interviews/tasks.py`

```python
@shared_task
def process_video_response(video_response_id):
    """
    Process video response:
    1. Extract audio from video
    2. Transcribe audio to text
    3. Analyze video for body language
    4. Calculate duration and quality metrics
    """
```

#### 2. AI Analysis Task

**File**: `interviews/tasks.py`

```python
@shared_task
def analyze_interview_response(video_response_id):
    """
    AI analysis using LangChain + Gemini:
    1. Get transcribed text
    2. Sentiment analysis
    3. Content relevance scoring
    4. Generate recommendation (pass/fail)
    5. Store in AIAnalysis model
    """
```

#### 3. Complete Interview Analysis Task

**File**: `interviews/tasks.py`

```python
@shared_task
def analyze_complete_interview(interview_id):
    """
    Aggregate all video responses:
    1. Calculate overall score
    2. Create InterviewResult
    3. Trigger notification task
    4. Update processing queue
    """
```

#### 4. Email Notification Task

**File**: `notifications/tasks.py`

```python
@shared_task
def send_email_notification(notification_id):
    """
    Send email notification:
    1. Get email template
    2. Populate with applicant data
    3. Send via SMTP
    4. Update notification status
    """
```

#### 5. Reapplication Eligibility Checker

**File**: `results/tasks.py`

```python
@shared_task
def check_reapplication_eligibility():
    """
    Periodic task (runs daily):
    1. Find applicants eligible to reapply
    2. Send reapplication notification
    3. Update applicant status
    """
```

#### 6. Processing Queue Monitor

**File**: `processing/tasks.py`

```python
@shared_task
def monitor_processing_queue():
    """
    Monitor and manage queue:
    1. Check for stuck/failed tasks
    2. Auto-retry failed processing
    3. Log processing metrics
    """
```

**Total Celery Tasks: 6**

---

## 🎨 Option 3: Frontend Development (Next.js)

### Project Structure Setup

#### 1. Initialize Next.js Project

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
```

#### 2. Folder Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (portal)/
│   │   ├── recruiter/
│   │   ├── hr/
│   │   └── admin/
│   ├── apply/
│   ├── interview/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── forms/
│   ├── layouts/
│   └── shared/
├── lib/
│   ├── api/
│   ├── utils/
│   └── hooks/
├── types/
└── public/
```

### Pages to Build

#### Authentication Pages (2 pages)

1. **Login Page** (`/login`)

   - JWT authentication
   - Role-based redirect

2. **Register Page** (`/register`)
   - User registration form
   - Email verification

#### Applicant Pages (3 pages)

3. **Online Application Form** (`/apply`)

   - Multi-step form
   - Document upload
   - Form validation

4. **Interview Page** (`/interview/{id}`)

   - Video recording interface
   - Question display
   - Progress tracker

5. **Interview Result Page** (`/results/{id}`)
   - Display scores
   - Feedback
   - Next steps

#### Recruiter Portal (4 pages)

6. **Recruiter Dashboard** (`/recruiter/dashboard`)

   - Recent applicants
   - Pending interviews
   - Quick stats

7. **Walk-in Intake Form** (`/recruiter/intake`)

   - Create walk-in applicant
   - Start interview immediately

8. **Applicant List** (`/recruiter/applicants`)

   - Searchable table
   - Filters
   - Status updates

9. **Applicant Details** (`/recruiter/applicants/{id}`)
   - Full applicant profile
   - Interview history
   - Documents

#### HR Portal (3 pages)

10. **HR Dashboard** (`/hr/dashboard`)

    - Passed applicants
    - Statistics
    - Reports

11. **Results Review** (`/hr/results`)

    - Filter by date, score
    - Export functionality

12. **Applicant Profile** (`/hr/applicants/{id}`)
    - View full analysis
    - Interview videos
    - AI scores

#### Admin Portal (2 pages)

13. **Admin Dashboard** (`/admin/dashboard`)

    - System metrics
    - Processing queue status
    - User management

14. **Question Management** (`/admin/questions`)
    - CRUD for interview questions
    - Question bank

**Total Frontend Pages: 14**

---

## 🤖 Option 4: AI Integration (LangChain + Gemini)

### AI Components to Build

#### 1. Video Transcription Service

**File**: `interviews/ai/transcription.py`

- Extract audio from video
- Use speech-to-text API
- Generate transcript with timestamps

#### 2. Sentiment Analysis

**File**: `interviews/ai/sentiment.py`

- Analyze emotional tone
- Detect confidence levels
- Score from 0-100

#### 3. Content Relevance Analyzer

**File**: `interviews/ai/content_analyzer.py`

- Compare answer to question
- Check for key topics
- Evaluate completeness

#### 4. Body Language Analysis

**File**: `interviews/ai/body_language.py`

- Use OpenCV for facial detection
- Analyze gestures, posture
- Eye contact tracking
- Generate confidence metrics

#### 5. LangChain Pipeline

**File**: `interviews/ai/langchain_pipeline.py`

- Set up Gemini 2.5 Flash
- Create prompt templates
- Build RAG system for evaluation
- Chain multiple analyses

#### 6. Scoring Engine

**File**: `interviews/ai/scoring.py`

- Aggregate all metrics
- Apply weights to different factors
- Generate final score (0-100)
- Provide pass/fail recommendation

**AI Integration Components: 6**

---

## 🛠️ Option 5: Admin Interface Enhancement

### Django Admin Customizations

#### 1. Custom Dashboard

**File**: `core/admin_dashboard.py`

- Real-time statistics widgets
- Recent activity feed
- Processing queue status
- System health indicators

#### 2. Enhanced List Views

- Custom filters and search
- Colored status indicators
- Inline actions
- Bulk operations

#### 3. Custom Actions

- Bulk interview processing
- Mass email sending
- Export to CSV/Excel
- Archive old records

#### 4. Inline Editing

- Edit related models on same page
- Quick status updates
- Inline document preview

#### 5. Custom Admin Views

**File**: `core/admin_views.py`

- Processing queue monitor
- AI analysis preview
- Video player interface
- Statistics reports

**Admin Enhancements: 5 major features**

---

## 📅 Recommended Implementation Timeline

### Week 1-2: Foundation

- ✅ Models, migrations, superuser (COMPLETED)
- Phase 1: Build 4 MVP APIs
- Test end-to-end flow

### Week 3-4: Core Features

- Phase 2: Authentication + CRUD APIs (15 endpoints)
- Basic Celery tasks (video processing, AI analysis)

### Week 5-6: Advanced Features

- Phase 3: Advanced APIs (12 endpoints)
- Complete AI integration
- LangChain pipeline

### Week 7-8: Admin & Monitoring

- Phase 4: Processing & Notifications (10 endpoints)
- Celery monitoring tasks
- Admin interface enhancements

### Week 9-10: Reporting & Polish

- Phase 5: Results & Analytics (8 endpoints)
- Frontend MVP (core pages)
- Testing and bug fixes

### Week 11-12: Frontend & Integration

- Complete frontend pages
- End-to-end testing
- Performance optimization

---

## 🎯 Priority Matrix

### High Priority (Must Have for MVP)

1. ✅ Models & Database (DONE)
2. Phase 1 APIs (4 endpoints)
3. Basic Celery tasks (3 tasks)
4. Simple frontend forms (2 pages)
5. AI integration basics

### Medium Priority (Important)

- Phase 2 APIs (Authentication & CRUD)
- Email notifications
- Admin enhancements
- Processing queue management

### Low Priority (Nice to Have)

- Advanced analytics
- Export functionality
- Complex reporting
- Multiple interview types

---

## 📝 Files to Create Summary

### Immediate Next Steps (Phase 1):

1. `applicants/serializers.py`
2. `applicants/views.py`
3. `applicants/urls.py`
4. `interviews/serializers.py`
5. `interviews/views.py`
6. `interviews/urls.py`
7. `core/urls.py` (update main URLs)

### Celery Tasks:

8. `interviews/tasks.py`
9. `notifications/tasks.py`
10. `processing/tasks.py`
11. `results/tasks.py`

### AI Integration:

12. `interviews/ai/__init__.py`
13. `interviews/ai/transcription.py`
14. `interviews/ai/sentiment.py`
15. `interviews/ai/content_analyzer.py`
16. `interviews/ai/body_language.py`
17. `interviews/ai/langchain_pipeline.py`
18. `interviews/ai/scoring.py`

---

## 🚀 Ready to Start?

**Current Status**: Foundation Complete ✅

- Models: 14 tables created
- Migrations: Applied
- Superuser: Created
- Environment: Configured

**Recommended Next Step**:
Start with **Phase 1 MVP APIs (4 endpoints)** to get a working prototype.

Would you like me to:

1. Build the 4 MVP APIs?
2. Set up Celery tasks first?
3. Start AI integration?
4. Initialize the frontend?

Let me know which option you'd like to pursue first!
