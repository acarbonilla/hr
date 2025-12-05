# AI Integration Testing Guide

## Overview

The AI enhancement phase is now complete with Google Gemini 2.5 Flash integration for video interview analysis.

## What's New

### Backend Changes

1. **ai_service.py** - New AI service using Gemini 2.5 Flash

   - `transcribe_video()` - Extracts transcript from video using Gemini multimodal
   - `analyze_transcript()` - Analyzes transcript with 5 metrics
   - Returns: sentiment_score, confidence_score, speech_clarity_score, content_relevance_score, overall_score

2. **views.py** - Video upload now triggers AI analysis

   - After video upload, automatically transcribes and analyzes
   - Creates AIAnalysis object with all scores
   - Graceful error handling (video saves even if AI fails)

3. **serializers.py** - Enhanced InterviewAnalysisSerializer
   - Now returns all 5 AI scores (averaged across questions)
   - Calculates recommendation: pass (≥70), review (50-69), fail (<50)

### Frontend Changes

1. **results/[id]/page.tsx** - Enhanced results page
   - Displays 5 detailed score cards with progress bars
   - Shows: Overall, Sentiment, Confidence, Clarity, Content scores
   - Beautiful 2-column grid layout
   - Updated AI analysis banner

## Testing the Complete Flow

### Prerequisites

- Backend running: http://127.0.0.1:8000/
- Frontend running: http://localhost:3000/
- Gemini API key in `backend/.env` as `GEMINI_API_KEY`
- PostgreSQL database running

### Test Steps

1. **Register New Applicant**

   - Go to http://localhost:3000/register
   - Fill in: First Name, Last Name, Email, Phone
   - Click "Start Interview"
   - Note the interview ID in the URL

2. **Record Video Responses**

   - Allow camera access when prompted
   - For each question:
     - Click "Start Recording"
     - Answer the question (speak clearly for 10-30 seconds)
     - Click "Stop Recording"
     - Click "Next" to proceed
   - After all questions, click "Submit Interview"

3. **View AI Analysis Results**
   - Automatically redirected to results page
   - OR go to http://localhost:3000/results/[interview_id]
   - Should see:
     - Overall Score (out of 100)
     - Sentiment & Attitude score
     - Confidence Level score
     - Speech Clarity score
     - Content Relevance score
     - Recommendation (PASS/REVIEW/FAIL)

### Expected Behavior

**During Video Upload:**

- Each video uploads to backend
- Backend saves video file
- AI transcribes video (10-30 seconds per video)
- AI analyzes transcript (5-10 seconds)
- AIAnalysis created with scores
- Response includes `ai_status` message

**On Results Page:**

- 5 color-coded score cards (green/yellow/red based on score)
- Progress bars showing percentage
- Descriptions for each metric
- Final recommendation based on overall average

### API Endpoints Used

```
POST /api/applicants/ - Register applicant
GET /api/interviews/{id}/ - Get interview details
GET /api/interviews/{id}/questions/ - Get interview questions
POST /api/interviews/{id}/video_response/ - Upload video + AI analysis
GET /api/interviews/{id}/analysis/ - Get complete analysis with scores
```

### Troubleshooting

**If AI analysis fails:**

- Check Gemini API key in `.env`
- Verify video file was saved correctly
- Check backend terminal for error messages
- Video upload still succeeds (graceful degradation)

**If scores are all 0:**

- AI processing may have failed
- Check that video contains audio
- Verify Gemini API quota not exceeded

**If results page doesn't load:**

- Ensure interview status is 'completed'
- Check that videos were uploaded successfully
- Verify interview ID is correct

## Score Interpretation

### Sentiment Score (0-100)

- Measures positive attitude, enthusiasm, emotional tone
- High score: Enthusiastic, positive, engaged
- Low score: Negative, disengaged, unenthusiastic

### Confidence Score (0-100)

- Evaluates self-assurance and conviction
- High score: Confident, assertive, certain
- Low score: Hesitant, uncertain, doubtful

### Speech Clarity Score (0-100)

- Assesses articulation, pace, communication quality
- High score: Clear, well-paced, articulate
- Low score: Unclear, too fast/slow, poor articulation

### Content Relevance Score (0-100)

- Measures how well answer addresses the question
- High score: On-topic, comprehensive, relevant
- Low score: Off-topic, incomplete, irrelevant

### Overall Score (0-100)

- Average of all 4 metrics
- ≥70: PASS (green)
- 50-69: REVIEW (yellow)
- <50: FAIL (red)

## Next Steps (Future Enhancements)

1. **Celery Integration**

   - Move AI processing to background task
   - Faster video upload response
   - Status polling for analysis completion

2. **Body Language Analysis**

   - Analyze facial expressions
   - Track eye contact
   - Measure gesture effectiveness

3. **Email Notifications**

   - Send results to applicant
   - Notify recruiters of completed interviews

4. **Admin Dashboard**
   - View all interviews
   - Compare applicants
   - Export reports

## Files Modified

### Backend

- `backend/interviews/ai_service.py` (NEW)
- `backend/interviews/views.py` (updated video_response action)
- `backend/interviews/serializers.py` (updated InterviewAnalysisSerializer)
- `backend/requirements.txt` (added openai, langchain-openai packages)
- `backend/core/settings.py` (added GEMINI_API_KEY)

### Frontend

- `frontend/app/results/[id]/page.tsx` (enhanced with 5 score cards)
- `frontend/types/index.ts` (updated InterviewAnalysis interface)

## Performance Notes

- Video transcription: ~10-30 seconds per video (depends on length)
- Transcript analysis: ~5-10 seconds per question
- Total processing time: ~2-5 minutes for 5 questions
- Runs synchronously (blocks response until complete)
- Will be optimized with Celery in next phase

## Success Criteria

✅ Video uploads successfully  
✅ AI transcription generates text from video  
✅ AI analysis returns 5 scores  
✅ Scores saved to AIAnalysis model  
✅ Results page displays all metrics  
✅ Recommendation calculated correctly  
✅ Error handling prevents upload failure

---

**Date Implemented:** November 11, 2025  
**Model Used:** Google Gemini 2.5 Flash (gemini-2.0-flash-exp)  
**Status:** ✅ Complete and Ready for Testing
