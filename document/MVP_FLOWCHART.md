# HireNowPro MVP - System Flowchart

## Complete Application & Interview Process Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIRENOWPRO INTERVIEW FLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION & INTERVIEW SETUP
   ┌──────────────────────┐
   │ Applicant Registers  │
   │  POST /api/applicants│
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Status: 'pending'    │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Create Interview     │
   │ POST /api/interviews │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Status: 'scheduled'  │
   │ GET Questions        │
   └──────────┬───────────┘

2. VIDEO RECORDING (Loop for each question)
              ↓
   ┌──────────────────────┐
   │ Display Question     │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Record Video         │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Upload Video         │
   │ POST video-response  │
   └──────────┬───────────┘
              ↓
        [More Questions?]
         Yes ↑  │ No
             └──┘

3. SUBMISSION & PROCESSING
              ↓
   ┌──────────────────────┐
   │ Submit Interview     │
   │ POST /submit         │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Validation Check     │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Queue Processing     │
   │ Status: 'queued'     │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Celery Task Starts   │
   │ (Background)         │
   └──────────┬───────────┘

4. AI ANALYSIS
              ↓
   ┌──────────────────────┐
   │ 1. Transcribe Audio  │
   │ 2. Sentiment         │
   │ 3. Content Analysis  │
   │ 4. Body Language     │
   │ 5. Calculate Scores  │
   └──────────┬───────────┘
              ↓
   ┌──────────────────────┐
   │ Save AI Results      │
   │ Status: 'completed'  │
   └──────────┬───────────┘

5. FINAL RESULTS
              ↓
   ┌──────────────────────┐
   │ Calculate Final Score│
   │ (Average of all)     │
   └──────────┬───────────┘
              ↓
        [Score >= 70%?]
         ┌──┴──┐
         │     │
      YES│     │NO
         ↓     ↓
   ┌─────────┐ ┌─────────┐
   │ PASSED  │ │ FAILED  │
   │ ✓       │ │ ✗       │
   └────┬────┘ └────┬────┘
        │           │
        ↓           ↓
   Status:      Status:
   'passed'     'failed'
        │           │
        ↓           ↓
   Clear        Set reapply
   reapply      date: +1 month
   date             │
        │           │
        ↓           ↓
   Send         Send
   notification notification
        │           │
        ↓           ↓
   HR Portal    HR Portal
   Display      Display
        │           │
        ↓           ↓
   ┌─────────┐ ┌─────────┐
   │ ✓ DONE  │ │ Can     │
   │         │ │ Reapply │
   │         │ │ in 1    │
   │         │ │ month   │
   └─────────┘ └────┬────┘
                    │
                    └──> Back to Start

KEY POINTS:
- Registration → Interview Setup → Answer 5 Questions
- Upload Videos → Submit → AI Processing (Background)
- Pass (≥70%) → Status: 'passed' → No waiting period
- Fail (<70%) → Status: 'failed' → Wait 1 month to reapply
```

---

## Detailed Process Breakdown

### Phase 1: Applicant Registration

```mermaid
graph LR
    A[User Visits Website] --> B[Fill Registration Form]
    B --> C[Submit Form]
    C --> D[POST /api/applicants/]
    D --> E{Validation}
    E -->|Valid| F[Create Applicant Record]
    E -->|Invalid| G[Show Errors]
    F --> H[Status: pending]
    H --> I[Return Applicant ID]

    style F fill:#c8e6c9
    style H fill:#fff9c4
```

**API Endpoint:** `POST /api/applicants/`

- **Input:** first_name, last_name, email, phone, application_source
- **Output:** Applicant object with ID and status
- **Status:** `pending`

---

### Phase 2: Interview Creation & Questions

```mermaid
graph TD
    A[Applicant ID] --> B[POST /api/interviews/]
    B --> C[Create Interview Record]
    C --> D[Status: scheduled]
    D --> E[GET /api/questions/]
    E --> F[Return Active Questions]
    F --> G[Display Questions to Applicant]

    style C fill:#c8e6c9
    style F fill:#bbdefb
```

**API Endpoints:**

1. `POST /api/interviews/` - Create interview session

   - **Input:** applicant_id, interview_type
   - **Output:** Interview object with ID

2. `GET /api/questions/` - Get all active questions
   - **Output:** List of questions (ordered by order field)

---

### Phase 3: Video Recording & Upload

```mermaid
graph TD
    A[Question Displayed] --> B[Start Recording]
    B --> C[Applicant Records Answer]
    C --> D[Stop Recording]
    D --> E[Video File Ready]
    E --> F[POST /api/interviews/ID/video-response/]
    F --> G{Upload Success?}
    G -->|Yes| H[VideoResponse Created]
    G -->|No| I[Retry Upload]
    I --> F
    H --> J{More Questions?}
    J -->|Yes| A
    J -->|No| K[All Questions Answered]

    style H fill:#c8e6c9
    style K fill:#fff9c4
```

**API Endpoint:** `POST /api/interviews/{id}/video-response/`

- **Input:** question_id, video_file, duration
- **Output:** VideoResponse object
- **Process:** Repeat for each question

---

### Phase 4: Interview Submission & Processing

```mermaid
graph TD
    A[All Responses Uploaded] --> B[POST /api/interviews/ID/submit/]
    B --> C{All Questions<br/>Answered?}
    C -->|No| D[Error: Missing Responses]
    C -->|Yes| E[Validation Passed]
    E --> F[Create ProcessingQueue]
    F --> G[Status: queued]
    G --> H[Update Interview<br/>Status: submitted]
    H --> I[Trigger Celery Task]
    I --> J[Background Processing Starts]

    style E fill:#c8e6c9
    style F fill:#ffccbc
    style I fill:#ce93d8
```

**API Endpoint:** `POST /api/interviews/{id}/submit/`

- **Validation:** Ensures all questions have video responses
- **Actions:**
  1. Create ProcessingQueue record
  2. Update interview status to 'submitted'
  3. Trigger async Celery task

---

### Phase 5: AI Analysis Processing (Background)

```mermaid
graph TD
    A[Celery Task Started] --> B[Get All VideoResponses]
    B --> C[For Each Video Response]
    C --> D[1. Extract Audio]
    D --> E[2. Transcribe Speech<br/>Using Gemini AI]
    E --> F[3. Sentiment Analysis<br/>0-100 score]
    F --> G[4. Content Analysis<br/>Relevance & Quality]
    G --> H[5. Body Language<br/>Eye contact, posture, etc.]
    H --> I[6. Confidence Score<br/>0-100]
    I --> J[7. Calculate Overall Score<br/>Weighted average]
    J --> K{Overall Score<br/>>= 70?}
    K -->|Yes| L[Recommendation: HIRE]
    K -->|No| M[Recommendation: REJECT]
    L --> N[Save AIAnalysis Record]
    M --> N
    N --> O{More Responses<br/>to Process?}
    O -->|Yes| C
    O -->|No| P[All Responses Analyzed]
    P --> Q[Update ProcessingQueue<br/>Status: completed]
    Q --> R[Update Interview<br/>Status: completed]

    style E fill:#f8bbd0
    style F fill:#f8bbd0
    style G fill:#f8bbd0
    style H fill:#f8bbd0
    style L fill:#4caf50,color:#fff
    style M fill:#f44336,color:#fff
    style R fill:#c8e6c9
```

**AI Analysis Components:**

1. **Transcription:** Convert speech to text using Gemini AI
2. **Sentiment Score:** Analyze emotional tone (0-100)
3. **Confidence Score:** Measure speaking confidence (0-100)
4. **Body Language:** JSON analysis of visual cues
5. **Overall Score:** Weighted average of all metrics
6. **Recommendation:** HIRE (≥70%) or REJECT (<70%)

---

### Phase 6: Results & Status Updates

```mermaid
graph TD
    A[All Responses Analyzed] --> B[Calculate Final Score<br/>Average of all responses]
    B --> C[Create InterviewResult]
    C --> D{Final Score<br/>>= 70%?}

    D -->|Yes - PASSED| E[Set passed = True]
    E --> F[PUT /api/applicants/ID/<br/>status: 'passed']
    F --> G[Clear reapplication_date]
    G --> H[Send Email Notification]
    H --> I[Mark hr_portal_displayed]
    I --> J[HR Can View Result]
    J --> K([Applicant Passed<br/>Eligible for Hiring])

    D -->|No - FAILED| L[Set passed = False]
    L --> M[PUT /api/applicants/ID/<br/>status: 'failed']
    M --> N[Set reapplication_date<br/>= Today + 1 Month]
    N --> O[Send Email Notification]
    O --> P[Mark hr_portal_displayed]
    P --> Q[HR Can View Result]
    Q --> R([Applicant Failed<br/>Can Reapply in 1 Month])

    style E fill:#4caf50,color:#fff
    style K fill:#4caf50,color:#fff
    style L fill:#f44336,color:#fff
    style R fill:#f44336,color:#fff
    style N fill:#ffe0b2
```

**Automatic Status Updates:**

- **PASSED:**

  - Applicant status → `'passed'`
  - `reapplication_date` → `null` (cleared)
  - Email notification sent
  - Displayed in HR portal

- **FAILED:**
  - Applicant status → `'failed'`
  - `reapplication_date` → Today + 1 month (e.g., Dec 10, 2025)
  - Email notification sent
  - Displayed in HR portal
  - Applicant can reapply after reapplication_date

---

## API Endpoints Summary

### 1. Applicant Registration

```
POST /api/applicants/
GET  /api/applicants/
GET  /api/applicants/{id}/
PUT  /api/applicants/{id}/
PATCH /api/applicants/{id}/
```

### 2. Interview Management

```
POST /api/interviews/
GET  /api/interviews/
GET  /api/interviews/{id}/
POST /api/interviews/{id}/video-response/
GET  /api/interviews/{id}/analysis/
POST /api/interviews/{id}/submit/
```

### 3. Interview Questions

```
GET /api/questions/
GET /api/questions/{id}/
```

---

## Data Models Relationships

```mermaid
erDiagram
    APPLICANT ||--o{ INTERVIEW : "has many"
    APPLICANT ||--o| REAPPLICATION_TRACKING : "has one"
    APPLICANT ||--o{ INTERVIEW_RESULT : "has many"

    INTERVIEW ||--o{ VIDEO_RESPONSE : "has many"
    INTERVIEW ||--o| PROCESSING_QUEUE : "has one"
    INTERVIEW ||--o| INTERVIEW_RESULT : "has one"

    INTERVIEW_QUESTION ||--o{ VIDEO_RESPONSE : "used in"

    VIDEO_RESPONSE ||--|| AI_ANALYSIS : "has one"

    APPLICANT {
        int id PK
        string first_name
        string last_name
        string email UK
        string phone
        string application_source
        string status
        date reapplication_date
        datetime application_date
    }

    INTERVIEW {
        int id PK
        int applicant_id FK
        string interview_type
        string status
        datetime scheduled_at
        datetime completed_at
    }

    INTERVIEW_QUESTION {
        int id PK
        string question_text
        string question_type
        int order
        boolean is_active
    }

    VIDEO_RESPONSE {
        int id PK
        int interview_id FK
        int question_id FK
        string video_file_path
        int duration
        boolean processed
        datetime uploaded_at
    }

    AI_ANALYSIS {
        int id PK
        int video_response_id FK
        text transcript_text
        float sentiment_score
        float confidence_score
        json body_language_analysis
        float overall_score
        string recommendation
    }

    INTERVIEW_RESULT {
        int id PK
        int interview_id FK
        int applicant_id FK
        float final_score
        boolean passed
        boolean hr_portal_displayed
        boolean email_notification_sent
        datetime result_date
    }

    PROCESSING_QUEUE {
        int id PK
        int interview_id FK
        string status
        string celery_task_id
        datetime queued_at
        datetime completed_at
    }
```

---

## Status Transitions

### Applicant Status Flow

```mermaid
stateDiagram-v2
    [*] --> pending: Registration
    pending --> in_review: Interview Created
    in_review --> passed: Score >= 70%
    in_review --> failed: Score < 70%
    failed --> pending: After reapplication_date
    passed --> [*]: Hired

    note right of passed
        reapplication_date = null
    end note

    note right of failed
        reapplication_date = +1 month
    end note
```

### Interview Status Flow

```mermaid
stateDiagram-v2
    [*] --> scheduled: Created
    scheduled --> in_progress: First Video Uploaded
    in_progress --> in_progress: More Videos Uploaded
    in_progress --> submitted: All Questions Answered
    submitted --> completed: AI Analysis Done
    completed --> [*]: Results Generated
```

### Processing Queue Status Flow

```mermaid
stateDiagram-v2
    [*] --> queued: Interview Submitted
    queued --> processing: Celery Task Started
    processing --> completed: Analysis Finished
    processing --> failed: Error Occurred
    failed --> queued: Retry
    completed --> [*]: Results Saved
```

---

## Timeline Example (Single Applicant)

```mermaid
gantt
    title Complete Interview Process Timeline
    dateFormat YYYY-MM-DD

    section Applicant
    Registration           :a1, 2025-11-10, 1d
    Wait for Interview     :a2, after a1, 1d

    section Interview
    Create Interview       :i1, 2025-11-11, 1h
    Answer Questions (5)   :i2, after i1, 30m
    Submit Interview       :i3, after i2, 5m

    section AI Processing
    Queue Processing       :p1, after i3, 1m
    AI Analysis (Background):p2, after p1, 5m
    Generate Results       :p3, after p2, 2m

    section Notifications
    Update Applicant Status:n1, after p3, 1m
    Send Email             :n2, after n1, 1m
    HR Portal Display      :n3, after n2, 1m

    section Outcomes
    If Passed - Done       :milestone, after n3, 0d
    If Failed - Reapply    :milestone, 2025-12-11, 0d
```

**Total Time:**

- **Applicant Actions:** ~35-40 minutes (registration + answering questions)
- **System Processing:** ~10 minutes (AI analysis + results)
- **Reapplication Wait:** 1 month (if failed)

---

## Key Features Summary

### ✅ Implemented in MVP

1. **Applicant Registration** - Public API, no authentication required
2. **Interview Creation** - Links applicant to interview session
3. **Question Management** - Admin creates questions, API serves them
4. **Video Upload** - Accept video files for each question
5. **Analysis Retrieval** - Get AI analysis results
6. **Submission Validation** - Ensure all questions answered
7. **Automatic Status Updates** - Pass/Fail based on 70% threshold
8. **Reapplication Logic** - Auto-set date to +1 month if failed

### 🔄 To Be Implemented (Future Phases)

1. **AI Processing** - LangChain + Gemini integration
2. **Celery Tasks** - Async background processing
3. **Email Notifications** - Automated emails to applicants
4. **HR Portal** - Web interface for recruiters
5. **Authentication** - JWT tokens for protected endpoints
6. **Document Upload** - Resume/CV handling
7. **Advanced Analytics** - Detailed reporting dashboard

---

## Testing Checklist

- [ ] **Applicant Registration**

  - [ ] POST /api/applicants/ creates new applicant
  - [ ] Returns applicant ID and status='pending'
  - [ ] Email uniqueness validated

- [ ] **Interview Creation**

  - [ ] POST /api/interviews/ with valid applicant_id
  - [ ] Returns interview ID and status='scheduled'
  - [ ] GET /api/questions/ returns active questions

- [ ] **Video Upload**

  - [ ] POST video for each question
  - [ ] Verify VideoResponse records created
  - [ ] Check video files saved to media folder

- [ ] **Interview Submission**

  - [ ] POST submit fails if missing responses
  - [ ] POST submit succeeds when all answered
  - [ ] ProcessingQueue created with status='queued'
  - [ ] Interview status updated to 'submitted'

- [ ] **Status Updates**

  - [ ] PATCH applicant status to 'failed'
  - [ ] Verify reapplication_date set to +1 month
  - [ ] PATCH applicant status to 'passed'
  - [ ] Verify reapplication_date cleared

- [ ] **Analysis Retrieval**
  - [ ] GET /api/interviews/{id}/analysis/
  - [ ] Returns aggregated scores
  - [ ] Shows recommendation (HIRE/REJECT)

---

## Production Deployment Considerations

```mermaid
graph TD
    A[Local Development] --> B[Testing Phase]
    B --> C[Staging Environment]
    C --> D{All Tests<br/>Passed?}
    D -->|No| E[Fix Issues]
    E --> B
    D -->|Yes| F[Production Deployment]

    F --> G[Set up PostgreSQL]
    F --> H[Set up Redis]
    F --> I[Configure Celery Workers]
    F --> J[Set up File Storage]
    F --> K[Configure Email Service]

    G --> L[Run Migrations]
    H --> L
    I --> L
    J --> L
    K --> L

    L --> M[Create Superuser]
    M --> N[Add Interview Questions]
    N --> O[Configure CORS]
    O --> P[Set Environment Variables]
    P --> Q[Start Services]

    Q --> R[Monitor Logs]
    R --> S[System Live]

    style F fill:#4caf50,color:#fff
    style S fill:#4caf50,color:#fff
```

---

## Quick Reference

| Component              | Endpoint                               | Method | Purpose                    |
| ---------------------- | -------------------------------------- | ------ | -------------------------- |
| Applicant Registration | `/api/applicants/`                     | POST   | Register new applicant     |
| Interview Creation     | `/api/interviews/`                     | POST   | Start interview session    |
| Get Questions          | `/api/questions/`                      | GET    | Fetch all active questions |
| Upload Video           | `/api/interviews/{id}/video-response/` | POST   | Submit video answer        |
| Submit Interview       | `/api/interviews/{id}/submit/`         | POST   | Complete interview         |
| Get Analysis           | `/api/interviews/{id}/analysis/`       | GET    | Retrieve AI results        |
| Update Status          | `/api/applicants/{id}/`                | PATCH  | Change applicant status    |

**Status Values:**

- Applicant: `pending`, `in_review`, `passed`, `failed`
- Interview: `scheduled`, `in_progress`, `submitted`, `completed`
- Processing: `queued`, `processing`, `completed`, `failed`

**Scoring Threshold:** 70% = Pass/Fail cutoff

**Reapplication:** Automatically set to +1 month from failure date

---

_Generated: November 10, 2025_
_HireNowPro MVP - Phase 1_
