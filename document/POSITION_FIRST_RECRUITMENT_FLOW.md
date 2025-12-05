# Position-First Recruitment Flow

## Overview

Restructured the recruitment flow to be position-centric, allowing applicants to apply for specific positions directly from the landing page. This creates a more intuitive and modern application experience.

## Implementation Date

December 2024

## New User Flow

### 1. Landing Page → Open Positions

- **Before**: "Get Started" button redirected to `/register`
- **After**: "Get Started" button redirects to `/positions`
- Users now see available jobs before signing up

### 2. Open Positions Page (`/positions`)

**Features:**

- Displays all available positions with details:
  - Virtual Assistant ($15-20/hr)
  - Data Entry Specialist ($12-15/hr)
  - Customer Support Representative ($14-18/hr)
- Each position shows:
  - Job title and icon
  - Employment type (Full-time/Part-time)
  - Location (Remote)
  - Salary range
  - Description
  - Requirements
- "Apply Now" button on each position card

**User Options:**

- Click "Apply Now" on any position
- Modal appears with two options:
  1. **New Application** - Creates new account
  2. **Returning User Sign In** - Login for existing users
- Position ID is passed through URL parameters

### 3. Registration Flow (`/register?position=<id>`)

**Enhancements:**

- Accepts `position` parameter from URL
- Auto-creates interview for the selected position
- Skips position selection page
- Redirects directly to interview for that position

**Implementation:**

```typescript
// Check for position parameter on mount
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const position = params.get("position");
  if (position) {
    setSelectedPosition(position);
  }
}, []);

// After registration, create interview
if (selectedPosition) {
  const interviewResponse = await interviewAPI.create({
    applicant_id: applicant.id,
    position_type: selectedPosition,
  });
  router.push(`/interview/${interview.id}`);
}
```

### 4. Login Flow (`/login?position=<id>`)

**Enhancements:**

- Accepts `position` parameter from URL
- For returning users applying to new positions
- Auto-creates interview for the selected position
- Redirects directly to interview

**Implementation:**

```typescript
// After login, create interview if position selected
if (selectedPosition && user.id) {
  const applicantResponse = await applicantAPI.getApplicant(user.id);
  const interviewResponse = await interviewAPI.create({
    applicant_id: user.id,
    position_type: selectedPosition,
  });
  router.push(`/interview/${interview.id}`);
}
```

## Complete Flow Diagram

```
┌─────────────────────┐
│   Landing Page      │
│   "Get Started"     │
└──────────┬──────────┘
           │
           v
┌─────────────────────┐
│  Open Positions     │
│  - Virtual Asst     │
│  - Data Entry       │
│  - Customer Support │
└──────────┬──────────┘
           │
           │ (Click Apply Now)
           v
┌─────────────────────┐
│    Modal Dialog     │
│                     │
│  New Application    │
│  Returning User     │
└──────────┬──────────┘
           │
           ├───────────────────────┐
           │                       │
           v                       v
┌─────────────────────┐  ┌─────────────────────┐
│  Register Page      │  │   Login Page        │
│  ?position=VA       │  │   ?position=VA      │
└──────────┬──────────┘  └──────────┬──────────┘
           │                        │
           │ (Auto-create           │ (Auto-create
           │  interview)            │  interview)
           │                        │
           v                        v
        ┌──────────────────────────────┐
        │    Interview Page            │
        │    /interview/[id]           │
        │    (For selected position)   │
        └──────────────────────────────┘
```

## Technical Changes

### Files Modified

#### 1. `frontend/app/page.tsx`

- Changed "Get Started" button redirect from `/register` to `/positions`

#### 2. `frontend/app/positions/page.tsx` (NEW)

- Created open positions listing page
- Static position data (will integrate with backend later)
- Apply button opens modal with registration/login options
- Passes position ID through URL parameters

#### 3. `frontend/app/register/page.tsx`

- Added position parameter detection
- Auto-creates interview if position is selected
- Redirects directly to interview page
- Falls back to position-select if interview creation fails

#### 4. `frontend/app/login/page.tsx`

- Added position parameter detection
- Fetches applicant details after login
- Auto-creates interview if position is selected
- Redirects directly to interview page
- Falls back to dashboard if interview creation fails

## Benefits

### User Experience

1. **Clarity**: Users see jobs before committing to sign up
2. **Intent**: Apply for specific roles, not general applications
3. **Efficiency**: Fewer steps to start interview
4. **Professional**: Matches modern recruitment platforms

### Technical Benefits

1. **Better conversion**: Users see value (job listings) before signup
2. **Reduced friction**: Skip position selection step
3. **Position tracking**: Know which job brought each applicant
4. **Flexible**: Supports both new and returning users

## Future Enhancements

### Backend Integration

- Connect positions page to Django `PositionType` model
- Load available positions dynamically from API
- Add position status (Open/Closed)
- Track application source per position

### Additional Features

- Position search and filtering
- Save favorite positions
- Email alerts for new positions
- Position recommendations based on skills
- Application history for returning users

### Analytics

- Track which positions get most views
- Measure apply button click-through rate
- A/B test position descriptions
- Monitor completion rates per position

## Position Type Mapping

Current static positions map to backend `position_type`:

- `"VA"` → Virtual Assistant
- `"DE"` → Data Entry Specialist
- `"CS"` → Customer Support Representative

## Testing Checklist

- [ ] Landing page redirects to /positions
- [ ] Positions page displays correctly
- [ ] Apply Now button opens modal
- [ ] New Application redirects to /register with position param
- [ ] Returning User redirects to /login with position param
- [ ] Registration creates interview for selected position
- [ ] Login creates interview for selected position
- [ ] Interview page loads with correct position
- [ ] Fallback to position-select if interview creation fails
- [ ] Modal closes when clicking X or outside
- [ ] Home button returns to landing page

## Related Documentation

- `POSITION_SELECTION_FLOW.md` - Original position selection system
- `INTERVIEW_FLOW_VISUAL_GUIDE.md` - Complete interview process
- `MVP_COMPLETION.md` - Overall MVP status
