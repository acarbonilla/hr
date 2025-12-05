# AI Analysis Issue - Root Cause & Solution

## Problem
Applicant "Test Applicant" shows **Overall Score: 0** and no AI analysis data in the results page.

## Root Cause
After investigation, I found that:

1. **Videos have no audible speech** - The transcription results show:
   - Video 113: "[No audible speech]" → Score: 0
   - Video 116: "There is no spoken content in the video" → Score: 0
   - Video 117: "Okay" → Score: 11.25 (minimal speech)
   - Video 114: "[No audible speech]" → Score: 0
   - Video 115: Transcription failed (Gemini safety filter)

2. **Original Processing Failed Silently** - The interview was marked as "completed" but the videos were never actually processed:
   - Transcript length: 0 for all videos
   - AI Score: None
   - Processed: False
   - AI Analysis: Does not exist

## Why This Happened

### Issue 1: Code Bug in `ai_service.py`
There was a parameter name mismatch in the `_log_token_usage()` method:
- Method signature used `prompt` 
- But calls used `prompt_text`
- This caused the logging to fail, which then caused the entire transcription to fail silently

**Fix Applied:** Changed all `prompt_text` parameters to `prompt` in `ai_service.py`

### Issue 2: No Audio in Videos
The applicant's videos contain no meaningful speech. This could be due to:
- Microphone not working during recording
- Applicant didn't speak
- Audio not captured properly
- Very short responses (only "Okay")

## Solutions

### For This Specific Applicant
I ran the reprocessing command:
```bash
python manage.py reprocess_videos --interview 36
```

**Results:**
- 4 videos successfully processed (but with 0 or very low scores due to no speech)
- 1 video failed (Gemini safety filter)

The applicant will still have very low scores because there's no actual speech content to analyze.

### Recommendations

1. **Add Audio Validation** - Before submitting the interview, check if the video has audible audio
   
2. **Show Recording Preview** - Let applicants review their recording before submitting to ensure audio is captured

3. **Add Microphone Test** - Test the microphone before starting the interview

4. **Minimum Speech Duration** - Require a minimum speech duration (e.g., 10 seconds) per question

5. **Better Error Handling** - If transcription fails, show a clear error to the applicant instead of silently failing

## Code Fixes Applied

### 1. Fixed `ai_service.py` Parameter Mismatch
Changed all occurrences of `prompt_text` to `prompt` in the `_log_token_usage()` calls.

### 2. Created Diagnostic Command
Created `check_applicant.py` management command to diagnose interview processing issues.

## Testing the Full Flow

To properly test the interview flow with actual speech:

1. **Record videos with actual speech** - Speak clearly for at least 30 seconds per question
2. **Check audio levels** - Ensure microphone is working before recording
3. **Review before submit** - Watch the recording to verify audio is captured
4. **Submit interview** - The AI will process videos in the background
5. **Check results** - Scores should appear within 2-5 minutes

## Expected Scores for Good Responses

- **Sentiment Score**: 70-90 (positive, enthusiastic)
- **Confidence Score**: 70-90 (clear, assertive)
- **Speech Clarity**: 70-90 (good articulation)
- **Content Relevance**: 70-90 (addresses the question)
- **Overall Score**: 70-90 (average of above)

Scores below 50 indicate poor responses or technical issues (like no audio).
