# Position Selection Flow - Implementation Guide

## Overview

The position selection feature allows applicants to choose their target position after registration. Each position has tailored interview questions, providing a customized assessment experience.

## Flow Architecture

```
Registration → Position Selection → Interview → Results
     ↓                ↓                  ↓         ↓
  /register   /position-select    /interview/[id]  /results
```

## Frontend Implementation

### 1. Position Selection Page (`/position-select`)

**Location:** `frontend/app/position-select/page.tsx`

**Features:**

- 5 position cards with distinct icons and colors
- Hover tooltips showing detailed information
- Visual selection feedback (ring and scale animation)
- Loading state during interview creation
- Error handling and validation

**Positions:**

| Position            | Code                | Icon        | Skills                                                   |
| ------------------- | ------------------- | ----------- | -------------------------------------------------------- |
| Virtual Assistant   | `virtual_assistant` | Briefcase   | Calendar Management, Email Handling, Task Prioritization |
| Customer Service    | `customer_service`  | Headphones  | Customer Support, Problem Resolution, CRM Systems        |
| IT Support          | `it_support`        | Monitor     | Technical Troubleshooting, Hardware/Software Support     |
| Sales and Marketing | `sales_marketing`   | Trending Up | Sales Strategy, Lead Generation, Digital Marketing       |
| General Position    | `general`           | Users       | Adaptability, Communication, Problem Solving             |

**User Experience:**

1. User lands on page after registration
2. Views all 5 position cards with descriptions
3. Hovers over cards to see full skill requirements
4. Clicks to select a position (visual feedback)
5. Clicks "Continue to Interview" button
6. System creates interview and redirects

### 2. Modified Registration Flow

**Location:** `frontend/app/register/page.tsx`

**Changes:**

- Removed direct interview creation
- Now redirects to `/position-select?applicant_id=${applicant.id}`
- Position selection happens as separate step

**Old Flow:**

```javascript
// Created interview immediately
const interviewResponse = await interviewAPI.createInterview({
  applicant_id: applicant.id,
  interview_type: "initial_ai",
});
router.push(`/interview/${interview.id}`);
```

**New Flow:**

```javascript
// Redirect to position selection
router.push(`/position-select?applicant_id=${applicant.id}`);
```

### 3. Interview Page Updates

**Location:** `frontend/app/interview/[id]/page.tsx`

**Changes:**

- Fetches position-specific questions from localStorage
- Uses query parameter filtering: `?position=virtual_assistant`
- Falls back to all questions if no position selected

**Implementation:**

```javascript
// Get selected position from localStorage
const selectedPosition = localStorage.getItem("selected_position");

// Fetch position-specific questions
const questionsResponse = selectedPosition
  ? await questionAPI.getQuestions({ position: selectedPosition })
  : await questionAPI.getQuestions();
```

### 4. API Library Updates

**Location:** `frontend/lib/api.ts`

**Changes:**

- Enhanced `questionAPI.getQuestions()` to accept optional parameters
- Supports filtering by position and question type

**API Signature:**

```typescript
getQuestions: (params?: { position?: string; type?: string }) => api.get("/questions/", { params });
```

## Backend Integration

### API Endpoints

**Get Position-Specific Questions:**

```
GET /api/questions/?position=virtual_assistant
```

**Response:**

```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "question_text": "How do you prioritize multiple tasks?",
      "question_type": "behavioral",
      "position_type": "virtual_assistant",
      "order": 1
    }
  ]
}
```

**Filter by Position and Type:**

```
GET /api/questions/?position=it_support&type=technical
```

### Database Schema

**InterviewQuestion Model Fields:**

- `question_text`: Text
- `question_type`: Choice (technical, behavioral, situational, general)
- `position_type`: Choice (virtual_assistant, customer_service, it_support, sales_marketing, general)
- `order`: Integer
- `is_active`: Boolean

## User Journey

### Step 1: Registration

- User fills out basic information
- System creates applicant record
- Redirects to position selection

### Step 2: Position Selection

- User views 5 position options
- Hovers to see detailed skill requirements
- Selects target position
- System creates interview with applicant_id
- Stores position in localStorage
- Redirects to interview page

### Step 3: Interview

- System loads interview by ID
- Retrieves position from localStorage
- Fetches position-specific questions
- User answers questions with video responses
- System analyzes responses

### Step 4: Results

- View AI-generated analysis
- See position-specific feedback

## Key Features

### 1. Visual Design

- **Gradient backgrounds:** Modern, professional appearance
- **Color-coded cards:** Each position has unique color scheme
- **Icon system:** Lucide React icons for visual identification
- **Hover effects:** Interactive tooltips and animations
- **Selection feedback:** Ring highlight and scale transformation

### 2. Responsive Design

- **Mobile:** Single column (stacked cards)
- **Tablet:** 2 columns
- **Desktop:** 3 columns
- Adapts to all screen sizes

### 3. Error Handling

- Validates applicant_id presence
- Displays error messages clearly
- Prevents submission without selection
- Handles API failures gracefully

### 4. Loading States

- Button shows spinner during submission
- Disabled state prevents double-clicks
- Clear feedback: "Creating Interview..."

## Testing Guide

### Manual Testing

1. **Registration Flow:**

   ```
   Navigate to: http://localhost:3000/register
   Fill form → Submit → Should redirect to position-select
   ```

2. **Position Selection:**

   ```
   Verify 5 position cards display
   Hover over each card → Check tooltip appears
   Click card → Check selection ring appears
   Click "Continue" → Should create interview
   ```

3. **Interview Questions:**
   ```
   Navigate to interview page
   Check console logs for API call
   Verify position parameter in request
   Confirm questions match selected position
   ```

### API Testing

**Test Position Filtering:**

```bash
curl http://localhost:8000/api/questions/?position=virtual_assistant
```

**Expected Result:** 5 questions specific to Virtual Assistant

**Test Combined Filtering:**

```bash
curl http://localhost:8000/api/questions/?position=it_support&type=technical
```

**Expected Result:** Technical questions for IT Support only

### Browser Testing

**localStorage Check:**

```javascript
// In browser console after position selection
console.log(localStorage.getItem("selected_position"));
// Should return: "virtual_assistant", "customer_service", etc.
```

## Position Data Reference

### Virtual Assistant

**Description:** Provide remote administrative support including calendar management, email handling, scheduling, and document organization.

**Skills:**

- Calendar Management
- Email Handling
- Task Prioritization
- Document Management
- Remote Communication

### Customer Service

**Description:** Assist customers with inquiries, resolve issues, provide product information, and ensure customer satisfaction.

**Skills:**

- Customer Support
- Problem Resolution
- CRM Systems
- Communication
- Patience

### IT Support

**Description:** Provide technical assistance, troubleshoot hardware and software issues, and support end-users with technology needs.

**Skills:**

- Technical Troubleshooting
- Hardware/Software Support
- Operating Systems
- Ticket Management
- Remote Support

### Sales and Marketing

**Description:** Drive sales growth, develop marketing campaigns, manage leads, and build customer relationships to achieve revenue targets.

**Skills:**

- Sales Strategy
- Lead Generation
- Digital Marketing
- Campaign Management
- Customer Relations

### General Position

**Description:** Open application for various roles. Interview will include general questions applicable to multiple positions.

**Skills:**

- Adaptability
- Communication
- Problem Solving
- Time Management
- Teamwork

## Troubleshooting

### Issue: Questions not filtering

**Solution:** Check localStorage has position stored

```javascript
localStorage.getItem("selected_position");
```

### Issue: Interview creation fails

**Solution:** Verify applicant_id in URL parameter

```
/position-select?applicant_id=123
```

### Issue: Position cards not displaying

**Solution:** Check Tailwind CSS classes compiled correctly

- Verify `bg-linear-to-r` classes work
- Check icon imports from lucide-react

### Issue: Redirect loop

**Solution:** Ensure registration doesn't create interview

- Check handleSubmit in register/page.tsx
- Should only create applicant, not interview

## Future Enhancements

### Phase 1 (Current)

- ✅ Position selection UI
- ✅ Position-specific questions
- ✅ Hover tooltips
- ✅ Visual feedback

### Phase 2 (Planned)

- [ ] Store position_type in Interview model
- [ ] Position-based scoring algorithms
- [ ] Position-specific passing criteria
- [ ] Comparison against position benchmarks

### Phase 3 (Future)

- [ ] Dynamic question generation per position
- [ ] Position skill matrix matching
- [ ] Custom question templates per position
- [ ] Position-specific video analysis parameters

## Code Snippets

### Creating Position Cards Programmatically

```typescript
const positions: Position[] = [
  {
    code: "virtual_assistant",
    title: "Virtual Assistant",
    description: "Remote administrative support...",
    icon: <Briefcase className="w-8 h-8" />,
    skills: ["Calendar Management", "Email Handling", ...],
    color: "from-blue-500 to-blue-600"
  },
  // ... more positions
];
```

### Fetching Position Questions

```typescript
const selectedPosition = localStorage.getItem("selected_position");
const questionsResponse = await questionAPI.getQuestions({
  position: selectedPosition,
});
```

### Creating Interview with Position

```typescript
const interviewResponse = await interviewAPI.createInterview({
  applicant_id: applicantId,
  interview_type: "initial_ai",
});

// Store position for question filtering
localStorage.setItem("selected_position", selectedPosition);
```

## Deployment Checklist

- [ ] Backend migrations applied
- [ ] Sample questions created for all positions
- [ ] Frontend build successful
- [ ] API endpoints tested
- [ ] Position selection page accessible
- [ ] Registration flow updated
- [ ] Interview fetches correct questions
- [ ] Error handling tested
- [ ] Mobile responsive verified
- [ ] Browser compatibility checked

## Summary

The position selection flow enhances the applicant experience by:

1. **Personalization:** Questions match the role they're applying for
2. **Clarity:** Clear understanding of position requirements
3. **Efficiency:** Targeted assessment reduces irrelevant questions
4. **Professionalism:** Polished UI with smooth interactions

This implementation provides a solid foundation for position-based interviewing with room for future enhancements like position-specific scoring and custom question generation.
