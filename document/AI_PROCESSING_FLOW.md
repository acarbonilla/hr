# AI Processing Flow - Interview Analysis System

## Overview

The system uses Google Gemini 2.5 Flash AI to analyze video interview responses in real-time with intelligent polling and progress feedback.

## Processing Flow

### 1. Video Upload (During Interview)

**When:** User clicks "Next" after recording each question
**What happens:**

- Video file is uploaded to backend
- Backend saves video to `VideoResponse` model
- **AI processing starts immediately (synchronous)**
  - Transcribes video using Gemini multimodal API (~10-30 seconds)
  - Analyzes transcript for 5 metrics (~5-10 seconds)
  - Creates `AIAnalysis` record with scores
  - Marks video as `processed=True`
- Returns success response to frontend

**Duration:** 30-60 seconds per video (blocking)

### 2. Interview Submission

**When:** User clicks "Submit Interview" after all questions
**What happens:**

- Frontend calls `/api/interviews/{id}/submit/`
- Backend marks interview as `completed`
- Frontend redirects to `/results/{id}`

### 3. Results Page Loading (New Implementation)

#### Initial Load

1. Frontend fetches `/api/interviews/{id}/analysis/`
2. Backend returns:
   ```json
   {
     "analysis": {
       "overall_score": 0-100,
       "sentiment_score": 0-100,
       "confidence_score": 0-100,
       "speech_clarity_score": 0-100,
       "content_relevance_score": 0-100,
       "recommendation": "pass|review|fail"
     },
     "ai_processing_complete": true/false,
     "processing_stats": {
       "total_videos": 5,
       "processed_videos": 5,
       "videos_with_ai_analysis": 5
     }
   }
   ```

#### Intelligent Polling System

**Scenario A: AI Processing Complete (all scores > 0)**

- ✅ Display results immediately
- No polling needed

**Scenario B: AI Processing In Progress (scores = 0)**

- 🔄 Show animated processing screen with:
  - Pulsing AI brain icon
  - Progress indicators
  - Estimated time remaining
- Poll every 2 seconds (max 60 attempts = 2 minutes)
- Check if `overall_score > 0` or any score is non-zero
- Once scores appear → display results

**Scenario C: Processing Taking Too Long**

- After 2 minutes of polling
- Show message: "Analysis taking longer than expected, please refresh"
- User can manually refresh page

## Processing Screen Features

### Visual Elements

1. **Animated AI Brain Icon**

   - Pulsing animation
   - Ripple effect background
   - Blue color scheme

2. **Processing Steps Display**

   - ✓ Transcribing video responses
   - ✓ Analyzing sentiment and confidence
   - ✓ Evaluating speech clarity and content
   - ✓ Calculating final scores

3. **Time Estimate**

   - Shows: "30-60 seconds per video response"
   - Updates remaining time based on poll attempts

4. **Status Message**
   - "🤖 AI is analyzing your interview responses..."
   - Shows estimated minutes remaining

## API Endpoints

### Get Analysis (with AI status)

```
GET /api/interviews/{id}/analysis/
```

**Response:**

```json
{
  "analysis": {
    "interview_id": 9,
    "applicant_name": "John Doe",
    "overall_score": 75.5,
    "sentiment_score": 80.0,
    "confidence_score": 70.0,
    "speech_clarity_score": 85.0,
    "content_relevance_score": 67.0,
    "total_questions": 5,
    "answered_questions": 5,
    "recommendation": "pass"
  },
  "ai_processing_complete": true,
  "processing_stats": {
    "total_videos": 5,
    "processed_videos": 5,
    "videos_with_ai_analysis": 5
  }
}
```

### Upload Video Response (with AI processing)

```
POST /api/interviews/{id}/video-response/
```

**Request:**

```json
{
  "question_id": 1,
  "video_file_path": <file>,
  "duration": "00:00:45"
}
```

**Response:**

```json
{
  "message": "Video uploaded successfully",
  "video_response": {...},
  "ai_status": "AI analysis complete. Overall score: 75"
}
```

## Timing Breakdown

### Per Video Response

- **Upload:** 2-5 seconds (depends on file size)
- **Transcription:** 10-30 seconds (Gemini multimodal processing)
- **Analysis:** 5-10 seconds (Gemini text generation)
- **Database save:** < 1 second
- **Total:** ~30-60 seconds per video

### Full Interview (5 questions)

- **During interview:** Videos upload sequentially as user answers
- **Total recording time:** ~5-10 minutes (user speaking)
- **Total AI processing:** ~2.5-5 minutes (background during recording)
- **By the time user submits:** Most/all videos already processed
- **Results page wait:** 0-60 seconds (only if last video still processing)

## Edge Cases Handled

### 1. Quota Exceeded

**Problem:** Gemini API free tier quota exceeded
**Handling:**

- AI service catches exception
- Returns default scores (50.0 for all metrics)
- Video still saves successfully
- Error logged in console

**Solution:**

- Switch model: `gemini-2.5-flash` (stable, higher limits)
- Or upgrade to paid tier

### 2. Network Timeout

**Problem:** Gemini API timeout (video too long)
**Handling:**

- Exception caught in try/except
- Video marked as uploaded but not processed
- User can reprocess later with management command

### 3. Invalid Video Format

**Problem:** Video file corrupted or unsupported
**Handling:**

- Transcription fails gracefully
- Returns error message
- Video entry still created

### 4. Server Restart During Processing

**Problem:** Django server restarted while AI processing
**Handling:**

- Video saved but `processed=False`
- Can reprocess using management command:
  ```bash
  python manage.py reprocess_videos --interview-id <ID>
  ```

## Management Commands

### Reprocess All Unprocessed Videos

```bash
python manage.py reprocess_videos
```

### Reprocess Specific Interview

```bash
python manage.py reprocess_videos --interview-id 9
```

### Force Reprocess (even if already analyzed)

```bash
python manage.py reprocess_videos --interview-id 9 --force
```

## Configuration

### AI Model Selection

File: `backend/interviews/ai_service.py`

```python
self.model = genai.GenerativeModel('gemini-2.5-flash')
```

**Available models:**

- `gemini-2.5-flash` (recommended - stable, good limits)
- `gemini-2.0-flash-exp` (experimental - may have quota issues)
- `gemini-2.5-pro` (most capable - slower, more expensive)

### Polling Configuration

File: `frontend/app/results/[id]/page.tsx`

```javascript
const MAX_POLL_ATTEMPTS = 60; // 60 attempts
const POLL_INTERVAL = 2000; // 2 seconds = 2 minutes max wait
```

### AI Score Thresholds

- **Pass:** overall_score >= 70
- **Review:** overall_score 50-69
- **Fail:** overall_score < 50

## Monitoring & Debugging

### Check AI Processing Status

```python
from interviews.models import Interview, VideoResponse

# Check interview
interview = Interview.objects.get(id=9)
print(f"Total videos: {interview.video_responses.count()}")

# Check each video
for video in interview.video_responses.all():
    print(f"Video {video.id}: processed={video.processed}")
    if hasattr(video, 'ai_analysis'):
        print(f"  Score: {video.ai_analysis.overall_score}")
    else:
        print(f"  No AI analysis")
```

### Backend Logs

When AI processing runs, look for these logs:

```
[AI] Starting AI analysis for video response 5
[AI] Video path: /path/to/video.webm
[AI] Starting video transcription...
[AI] Transcription complete: Hello, my name is...
[AI] Starting transcript analysis...
[AI] Analysis result: {'sentiment_score': 85, ...}
[AI] AI analysis saved successfully. Scores: 75
```

### Frontend Console

Check browser console for:

```
Analysis data: {overall_score: 75, sentiment_score: 85, ...}
```

## Performance Optimization (Future)

### Phase 1: Current (Synchronous)

✅ **Implemented**

- AI processes during video upload
- Blocks response until complete
- Simple, reliable

### Phase 2: Background Processing (Next)

🔄 **To Implement**

- Celery task queue
- Redis for job management
- WebSocket for real-time updates
- Benefits:
  - Faster upload response
  - Parallel processing
  - Better error recovery
  - Scalability

### Phase 3: Optimizations

🔮 **Future**

- Batch video processing
- Caching frequently asked questions
- Pre-trained models for faster inference
- Edge computing for transcription

## User Experience Flow

1. **Recording:** User records 5 video responses (5-10 min)
2. **Uploading:** Each video uploads and processes as they go
3. **Submission:** User clicks "Submit Interview"
4. **Redirect:** Immediately goes to results page
5. **Processing Screen:**
   - If any videos still processing: Animated waiting screen
   - Polls every 2 seconds
   - Shows progress and time estimate
6. **Results Display:** Once all AI complete, shows full scores

## Success Indicators

✅ Video uploaded successfully  
✅ AI transcription generated  
✅ AI analysis returned all 5 scores  
✅ Scores saved to database  
✅ Results page displays immediately or after short poll  
✅ Scores match expected quality of responses

---

**Current Status:** ✅ Fully Functional with Intelligent Polling
**Model:** Google Gemini 2.5 Flash  
**Processing Time:** 30-60 seconds per video  
**Max Wait Time:** 2 minutes with polling  
**User Experience:** Professional with progress feedback
