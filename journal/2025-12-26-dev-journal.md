📘 HireNowPro — Development Journal

Date: Dec 26, 2025
Focus: HR Decision Flow, Applicant Feedback, Stability Fixes

1. HR Decision Logic – Final vs Non-Final

Na-detect at na-fix ang critical workflow issue:

PASS / FAIL → final decisions → locked ✔️

ON HOLD → non-final → editable ✔️

Inayos ang backend at frontend behavior:

ON HOLD decisions can now be updated later

HR can modify:

decision

hold date

HR comment

Prevented a future workflow deadlock for HR operations.

Insight: ON HOLD is not an end-state; it’s a control state.

2. Applicant Result Email Flow (Verified & Working)

Confirmed:

Email is manually triggered by HR, not automatic

Gmail SMTP configured correctly via .env

Successfully tested:

PASS email

FAIL email

Email logic:

Sends only once (idempotent)

Does not leak AI scores or internal reasoning

Decision:
✔️ Keep manual sending (safer, more professional, client-friendly)

3. Level 3 Developmental Feedback (Major Feature)

Implemented High-level developmental feedback (recommended default)

Feedback characteristics:

No scores

No “AI” wording

Constructive and role-aware

Appears in:

PASS

REVIEW

FAIL emails

Confirmed:

Feedback content is helpful, neutral, and safe

Strategic Insight:
This becomes a key differentiator vs multiply.ai (not just pass/fail).

4. HR Override Decision (Design Choice)

Question raised: Should HR be able to edit feedback before sending?

Decision:

❌ Not needed now

✔️ Keep backend-ready for future clients

Rationale:

Simpler UX

Less HR friction

Feature can be upsold later

5. Media / Video Playback Stability

Investigated and fixed:

Video not playing in HR Review

Media path resolution issues

Frontend URL normalization

Result:

Videos now load correctly

No regression after build + restart

6. Code Quality & Stability Fixes

Fixed:

Regex parsing error in resolveVideoUrl

Django indentation error in results views

Applicant model mismatch (full_name vs actual fields)

System now:

Builds cleanly

Runs without runtime blockers

Stable enough for demo / presentation

7. Product-Level Realizations

Interview system naturally forms 3 stages:

Initial Interview (AI-assisted)

Technical / Deep Evaluation

Final Human Interview

Decision:

Stage 2 & 3 can be combined later

Current system is a strong Stage 1 gatekeeper

8. Strategic Direction (Big Picture)

Clear advantage identified:

Competency-aware evaluation

Role-weighted scoring

Developmental feedback for applicants

Strong alignment with:

Responsible HR

Sustainability (less paper, more automation)

Enterprise readiness

✅ Status at End of Day

Core HR workflow is correct

Email + feedback pipeline is working

System is stable

Ready to design final presentation workflow tomorrow

🔜 Next Session (Planned)

Final workflow diagram (end-to-end)

Presentation-ready narrative:

Applicant journey

HR journey

AI’s role (advisory, not decision-maker)

Positioning HireNowPro as:
“AI-assisted, HR-controlled, future-ready recruitment.”