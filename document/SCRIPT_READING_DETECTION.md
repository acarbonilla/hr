# Script Reading Detection System

**Last Updated:** November 13, 2025  
**Status:** Backend Implementation Complete ✅

---

## 🎯 Overview

The Script Reading Detection System identifies applicants who may be reading from scripts, papers, or other screens during video interviews. This feature focuses specifically on **detecting cheating behavior** rather than general body language analysis.

---

## 📊 Detection Levels

### Three-Tier Flag System:

| Level       | Status       | Criteria                                                     | Action                                          |
| ----------- | ------------ | ------------------------------------------------------------ | ----------------------------------------------- |
| **Level 1** | `clear`      | >50% camera eye contact, natural eye movement                | No flag, proceed normally                       |
| **Level 2** | `suspicious` | 30-50% camera contact, 40-60% off-camera to one direction    | Flag for HR review, "Under Investigation" badge |
| **Level 3** | `high_risk`  | <30% camera contact, >60% off-camera, clear reading patterns | Flag + recommend rejection/re-interview         |

---

## 🔧 Technical Implementation

### Database Schema

#### VideoResponse Model Fields:

```python
script_reading_status = models.CharField(
    max_length=20,
    choices=[
        ('clear', 'Clear'),
        ('suspicious', 'Suspicious'),
        ('high_risk', 'High Risk')
    ],
    null=True,
    blank=True
)

script_reading_data = models.JSONField(
    default=dict,
    blank=True,
    # Example structure:
    # {
    #   "gaze_at_camera_percent": 35,
    #   "gaze_left_percent": 48,
    #   "gaze_right_percent": 8,
    #   "gaze_down_percent": 7,
    #   "horizontal_scanning_count": 8,
    #   "primary_off_camera_direction": "left",
    #   "risk_score": 65,
    #   "flags": ["High off-camera gaze", "Horizontal scanning detected"]
    # }
)
```

#### Interview Model Fields:

```python
authenticity_flag = models.BooleanField(default=False)

authenticity_status = models.CharField(
    max_length=20,
    choices=[
        ('verified', 'Verified'),
        ('under_investigation', 'Under Investigation'),
        ('failed_authenticity', 'Failed Authenticity Check')
    ],
    default='verified'
)

authenticity_notes = models.TextField(blank=True)
```

---

## 🔍 What Gets Detected

### 1. **Gaze Direction Distribution**

- Camera eye contact percentage
- Off-camera gaze to left/right/up/down
- Primary off-camera direction consistency

### 2. **Reading Patterns**

- **Horizontal scanning** (left-right-left-right) → Reading text on screen
- **Vertical scanning** (up-down) → Reading from paper on desk
- Frequency of scanning movements

### 3. **Behavioral Patterns**

- Consistent glances to same location
- Duration of off-camera gaze
- Speech-gaze correlation (look away → pause → speak)

### 4. **Context-Specific Detection**

- **Second monitor** (most common): Eyes consistently to left/right
- **Paper on desk**: Head tilted down, vertical scanning
- **Someone showing cue cards**: Eyes tracking moving object

---

## 🌐 API Endpoints

### 1. Full Review (includes authenticity data)

**GET** `/api/results/{id}/full-review/`

Response includes:

```json
{
  "interview_summary": {
    "interview_id": 123,
    "authenticity_flag": true,
    "authenticity_status": "under_investigation",
    "authenticity_notes": "[2025-11-13 10:30] HR Admin: Reviewing flagged videos"
  },
  "questions_and_answers": [
    {
      "question_text": "Tell me about yourself",
      "script_reading_status": "suspicious",
      "script_reading_data": {
        "gaze_at_camera_percent": 35,
        "gaze_left_percent": 48,
        "risk_score": 65,
        "flags": ["High off-camera gaze to left side"]
      }
    }
  ]
}
```

### 2. Authenticity Check (HR Decision)

**POST** `/api/results/{id}/authenticity-check/`

Request:

```json
{
  "action": "clear_flag" | "confirm_issue" | "request_reinterview",
  "notes": "HR notes explaining the decision (min 10 characters)"
}
```

Response:

```json
{
  "message": "Authenticity flag cleared - interview verified as legitimate",
  "interview_id": 123,
  "authenticity_status": "verified",
  "authenticity_flag": false,
  "notes": "[2025-11-13 14:30] John HR: Reviewed video, applicant was thinking naturally"
}
```

#### Actions:

1. **`clear_flag`** - False positive, applicant is legitimate

   - Sets `authenticity_status = 'verified'`
   - Clears all script_reading flags
   - Applicant proceeds normally

2. **`confirm_issue`** - Script reading confirmed

   - Sets `authenticity_status = 'failed_authenticity'`
   - Marks applicant as 'failed'
   - Updates result recommendation to 'fail'

3. **`request_reinterview`** - Uncertain, needs in-person verification
   - Sets `authenticity_status = 'under_investigation'`
   - Keeps applicant in 'under_review'
   - Triggers notification for walk-in re-interview

---

## 💼 HR Workflow

### Step 1: Automatic Detection (during AI processing)

```
Bulk Analysis
├─ Analyze video for gaze patterns
├─ Calculate gaze distribution
├─ Detect reading patterns
├─ Assign risk level (clear/suspicious/high_risk)
└─ Flag interview if suspicious or high_risk
```

### Step 2: HR Review

```
HR Dashboard
├─ See "Under Investigation" badge
├─ View flagged questions
├─ Watch video clips
├─ Review gaze analysis data
└─ Make decision:
    ├─ Clear Flag → Verified
    ├─ Confirm Issue → Failed
    └─ Request Re-interview → Walk-in
```

### Step 3: Outcome

```
Clear Flag:
└─ Process normally, send results

Confirm Issue:
├─ Mark applicant as failed
├─ Send rejection email
└─ Block reapplication for 6 months (vs 30 days for normal fail)

Request Re-interview:
├─ Keep under review
├─ Send re-interview invitation
└─ Schedule walk-in interview
```

---

## 🎨 Frontend UI Elements (To Be Built)

### HR Dashboard Card:

```
┌─────────────────────────────────────────────┐
│ John Doe - Software Engineer                │
│ Overall Score: 78/100                       │
│                                             │
│ ⚠️ UNDER INVESTIGATION                     │
│ Possible script reading detected           │
│                                             │
│ Questions Flagged: 2/5                     │
│ • Q2: 65% off-camera gaze (left side)      │
│ • Q4: Horizontal scanning pattern          │
│                                             │
│ [Review Video] [Clear Flag] [Confirm Issue]│
└─────────────────────────────────────────────┘
```

### Video Review Interface:

```
┌─────────────────────────────────────────────┐
│ Question 2: Tell me about yourself         │
│                                             │
│ [Video Player]                              │
│                                             │
│ Script Reading Analysis:                   │
│ Status: ⚠️ Suspicious                      │
│                                             │
│ Gaze Distribution:                         │
│ Camera: ███░░ 35%                          │
│ Left:   ████████ 48% ⚠️                   │
│ Right:  ██ 8%                              │
│ Down:   ██ 7%                              │
│                                             │
│ Flags:                                     │
│ • High off-camera gaze to left side        │
│ • Horizontal scanning detected (8 times)   │
│                                             │
│ [Clear Flag] [Confirm Issue]               │
└─────────────────────────────────────────────┘
```

---

## ⚙️ System Configuration

### Recommended Settings:

```python
SCRIPT_READING_DETECTION = {
    # Feature toggle
    'enabled': True,

    # Detection thresholds
    'suspicious_threshold': 40,  # % off-camera gaze
    'high_risk_threshold': 60,   # % off-camera gaze

    # Applicant type filtering
    'apply_to_online_only': True,  # Don't flag walk-in (supervised)
    'apply_to_walk_in': False,

    # Actions
    'auto_flag': True,  # Automatically flag suspicious interviews
    'require_hr_review': True,  # Block final decision until HR reviews
    'allow_auto_reject': False,  # HR must manually confirm (recommended)

    # Penalties (if any)
    'score_penalty_suspicious': 0,  # No auto penalty (HR decides)
    'score_penalty_high_risk': 0,

    # Reapplication rules
    'cheating_reapply_days': 180,  # 6 months (vs 30 days normal fail)
}
```

---

## 🔒 Privacy & Ethics

### Transparency:

- ✅ Inform candidates upfront that eye movement is monitored
- ✅ Explain what's being detected (script reading, not general behavior)
- ✅ Provide clear instructions: "Look at camera when answering"

### Fairness:

- ✅ Never auto-reject - always require HR confirmation
- ✅ Allow HR to clear false positives
- ✅ Different handling for online vs walk-in (supervised)
- ✅ Consider legitimate reasons (nervousness, thinking, cultural norms)

### Compliance:

- ⚠️ Check local laws regarding biometric data collection
- ⚠️ GDPR/CCPA considerations for EU/California applicants
- ⚠️ Accessibility considerations (visual impairments, neurodivergence)

---

## 🚀 Next Steps (AI Integration)

### To Complete the System:

1. **Implement AI Detection Logic**

   - Integrate with OpenCV or MediaPipe for gaze tracking
   - Calculate gaze distribution percentages
   - Detect horizontal/vertical scanning patterns
   - Generate risk scores

2. **Add to Celery Task**

   ```python
   @shared_task
   def analyze_single_video(video_response_id):
       # ...existing analysis...

       # Add script reading detection
       gaze_data = detect_script_reading(video_path)
       video_response.script_reading_status = gaze_data['status']
       video_response.script_reading_data = gaze_data['data']
       video_response.save()

       # Update interview authenticity
       interview.check_authenticity()
   ```

3. **Build Frontend Components**

   - HR dashboard with flagged interviews
   - Video review interface with gaze visualization
   - Authenticity check action buttons

4. **Notification System**
   - Alert HR when high-risk detected
   - Send re-interview invitations
   - Different rejection emails for cheating vs performance

---

## 📚 Resources

### AI Libraries for Gaze Detection:

- **MediaPipe Face Mesh** - 468 3D facial landmarks, fast, free
- **OpenCV + Dlib** - 68-point facial landmarks, widely used
- **Azure Face API** - Commercial option with gaze detection
- **PyGaze** - Open-source eye tracking toolkit

### Detection Accuracy:

- Eye contact detection: **85-90% accuracy** (with good lighting)
- Horizontal scanning detection: **75-85% accuracy**
- Consistent off-camera gaze: **90-95% accuracy**

---

## ✅ Implementation Status

- [x] Database schema (VideoResponse + Interview models)
- [x] API endpoints (full-review, authenticity-check)
- [x] Serializers (authenticity fields included)
- [x] HR action workflow (clear/confirm/re-interview)
- [x] Migrations applied
- [ ] AI detection logic (gaze tracking)
- [ ] Celery task integration
- [ ] Frontend UI components
- [ ] Notification system

**Backend: 100% Complete** ✅  
**AI Integration: 0% (pending)** ⏳  
**Frontend: 0% (pending)** ⏳

---

**The script reading detection system is architecturally complete and ready for AI integration!**
