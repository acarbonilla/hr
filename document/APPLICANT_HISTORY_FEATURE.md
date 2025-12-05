# Applicant History Feature

## Overview

Comprehensive tracking and history page for all applicants in the system. This feature provides recruiters with a complete view of every applicant's journey from application to final decision, including videos, transcripts, AI analysis, and processing history.

## Features

### 1. Main History Page

**Route:** `/hr-dashboard/history`

#### Key Capabilities:

- **Complete Applicant List**: View all applicants in the system
- **Advanced Search**: Search by name or email
- **Multiple Filters**: Filter by status, source, position, decision, dates, scores, and more
- **Pagination**: Navigate through large datasets (10, 25, 50, or 100 items per page)
- **Sorting**: Sort by different fields
- **Export**: Download data as CSV for external analysis
- **Real-time Stats**: See total counts and current page info

#### Available Filters:

- **Search**: Name or email
- **Status**: Pending, In Review, Passed, Failed, Hired, Withdrawn
- **Application Source**: Online or Walk-in
- **Final Decision**: Pending, Hired, Rejected
- **Has Interview**: Yes/No
- **Date Range**: From date to end date
- **Score Range**: Minimum and maximum scores
- **Position**: Filter by position code

#### Display Information:

- Applicant name and email
- Current status badge
- Application source (Online/Walk-in)
- Position applied for
- Interview score
- Final decision (Hired/Rejected/Pending)
- Application date and days since application
- Quick link to full details

### 2. Detailed History Page

**Route:** `/hr-dashboard/history/[applicantId]`

#### Three Main Tabs:

##### Overview Tab

Comprehensive information organized in cards:

**Personal Information:**

- Full name, email, phone
- Application source
- Application date
- Reapplication date (if applicable)

**Interview Information:**

- Position applied for
- Interview status
- Number of video responses
- Creation and submission dates
- Authenticity flags (if any)

**Result Information:**

- Final AI score (with color coding)
- AI recommendation (Pass/Fail)
- Result date
- Final HR decision (if made)
- Decision maker
- Decision date and notes

**Location Information** (if available):

- GPS coordinates
- Distance from office

##### Videos Tab

Full video interview review:

**Left Panel:**

- List of all interview questions
- Click to select and view
- Shows question number, text preview, type, and score

**Right Panel:**

- Video player
- Full question text
- Complete transcript
- AI analysis and score
- AI analysis summary
- HR override scores (if any)
- HR comments (if any)

##### Processing History Tab

Timeline of all processing events:

- Queue entry times
- Processing start times
- Completion times
- Status for each step
- Error messages (if any)
- Visual timeline with status indicators

## Backend API

### Main Endpoints

#### 1. History List Endpoint

```
GET /api/applicants/history/
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| search | string | Search by name or email | `search=John` |
| status | string | Filter by applicant status | `status=pending` |
| application_source | string | Filter by source | `application_source=online` |
| position | string | Filter by position code | `position=SALES` |
| final_decision | string | Filter by decision | `final_decision=hired` |
| date_from | date | Start date filter | `date_from=2025-01-01` |
| date_to | date | End date filter | `date_to=2025-12-31` |
| score_min | number | Minimum score | `score_min=50` |
| score_max | number | Maximum score | `score_max=75` |
| has_interview | boolean | Has interview or not | `has_interview=true` |
| page | number | Page number | `page=1` |
| page_size | number | Items per page (max 100) | `page_size=25` |
| ordering | string | Sort field | `ordering=-application_date` |

**Valid Ordering Fields:**

- `application_date`, `-application_date`
- `first_name`, `-first_name`
- `status`, `-status`
- `email`, `-email`

**Response Structure:**

```json
{
  "count": 150,
  "total_pages": 6,
  "current_page": 1,
  "page_size": 25,
  "results": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "application_source": "online",
      "status": "in_review",
      "application_date": "2025-01-15T10:30:00Z",
      "reapplication_date": null,
      "days_since_application": 5,
      "interview": {
        "id": 1,
        "position": "Sales Representative",
        "position_code": "SALES",
        "status": "submitted",
        "video_count": 5,
        "created_at": "2025-01-15T11:00:00Z"
      },
      "result": {
        "id": 1,
        "final_score": 72.5,
        "passed": true,
        "result_date": "2025-01-15T14:00:00Z",
        "final_decision": null,
        "final_decision_date": null,
        "final_decision_by": null
      }
    }
  ]
}
```

#### 2. Full History Endpoint

```
GET /api/applicants/{id}/full-history/
```

**Response Structure:**

```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "status": "in_review",
  "application_date": "2025-01-15T10:30:00Z",
  "interview": { ... },
  "result": { ... },
  "video_responses": [
    {
      "id": 1,
      "question_text": "Tell us about yourself",
      "question_type": "Introduction",
      "video_file_path": "/media/videos/...",
      "transcript": "Hello, my name is...",
      "ai_score": 75,
      "ai_analysis_summary": "Clear communication...",
      "sentiment": 65,
      "hr_override_score": null,
      "hr_comments": null,
      "status": "completed"
    }
  ],
  "processing_history": [
    {
      "id": 1,
      "status": "completed",
      "added_at": "2025-01-15T11:00:00Z",
      "started_at": "2025-01-15T11:01:00Z",
      "completed_at": "2025-01-15T11:05:00Z",
      "error_message": null
    }
  ]
}
```

## Use Cases

### For Recruiters:

1. **Complete Tracking**

   - See every applicant who applied
   - Track their progress through the system
   - View their current status at a glance

2. **Audit Trail**

   - See who made decisions and when
   - View notes and reasoning
   - Track processing history

3. **Data Analysis**

   - Export to CSV for external analysis
   - Filter by various criteria
   - Identify patterns and trends

4. **Quality Assurance**

   - Review past interviews
   - Check AI analysis accuracy
   - Verify decision consistency

5. **Follow-up Management**
   - Find applicants who can reapply
   - Track reapplication dates
   - Identify applicants to contact

### For Administrators:

1. **System Monitoring**

   - Check processing queue performance
   - Identify failed processes
   - Monitor error rates

2. **Compliance**

   - Complete audit trail
   - Decision documentation
   - Timeline tracking

3. **Performance Metrics**
   - Time from application to decision
   - Processing times
   - Decision patterns

## CSV Export Format

When exporting data, the CSV includes:

- Name
- Email
- Phone
- Application Source
- Status
- Application Date
- Position
- Score
- Final Decision
- Days Since Application

File naming: `applicant-history-YYYY-MM-DD.csv`

## Performance Considerations

### Backend Optimizations:

- **Select Related**: Preloads related objects to reduce queries
- **Prefetch Related**: Efficiently loads many-to-many relationships
- **Pagination**: Limits data transfer and processing
- **Distinct**: Removes duplicates from joined queries
- **Max Page Size**: Limited to 100 items to prevent performance issues

### Frontend Optimizations:

- **Lazy Loading**: Only loads data when needed
- **Debounced Search**: Waits for user to finish typing
- **Conditional Rendering**: Only renders visible elements
- **Pagination**: Prevents rendering thousands of rows at once

## Security Considerations

- **Authentication Required**: All endpoints require HR authentication
- **Token-based**: Uses JWT tokens for API access
- **Role-based**: Access controlled by HR role
- **Data Filtering**: Users only see authorized data

## Future Enhancements

1. **Advanced Analytics**

   - Charts and graphs on history page
   - Trend analysis over time
   - Comparative statistics

2. **Bulk Operations**

   - Bulk export with custom fields
   - Bulk status updates
   - Batch processing

3. **Email Integration**

   - Send follow-up emails from history
   - Schedule reapplication reminders
   - Automated notifications

4. **Custom Views**

   - Save filter presets
   - Custom column selection
   - Personalized dashboards

5. **Notes System**

   - Add recruiter notes at any stage
   - Timeline of all interactions
   - Collaboration features

6. **Advanced Search**

   - Full-text search across transcripts
   - Search by AI analysis content
   - Fuzzy matching for names

7. **Excel Export**
   - Export with formatting
   - Multiple sheets for different data
   - Charts and visualizations included

## Testing

### Manual Testing Checklist:

- [ ] Search functionality works
- [ ] All filters apply correctly
- [ ] Pagination navigates properly
- [ ] Sort order changes correctly
- [ ] Detail view loads all data
- [ ] Video player works
- [ ] CSV export downloads
- [ ] CSV contains correct data
- [ ] Processing history displays
- [ ] Authentication required
- [ ] Error handling works

### Test Scenarios:

1. **Empty State**: No applicants match filters
2. **Large Dataset**: 1000+ applicants
3. **Missing Data**: Applicants without interviews
4. **Incomplete Data**: Interviews without results
5. **Special Characters**: Names with accents, symbols
6. **Date Ranges**: Edge cases and invalid dates
7. **Score Boundaries**: Min/max validation
8. **Pagination**: First, last, and middle pages

## Troubleshooting

### Common Issues:

**Issue: No data showing**

- Check authentication token
- Verify API endpoint is correct
- Check browser console for errors
- Try resetting filters

**Issue: Slow loading**

- Reduce page size
- Use more specific filters
- Check network connection
- Clear browser cache

**Issue: CSV export fails**

- Check popup blocker
- Verify data exists to export
- Try smaller dataset
- Check browser console

**Issue: Videos not playing**

- Check video file permissions
- Verify CORS settings
- Check media server status
- Try different browser

## API Rate Limiting

- **Default**: No rate limiting on history endpoint
- **Recommendation**: Implement if needed based on usage
- **Best Practice**: Use pagination and filters to limit data transfer

## Data Retention

- History is maintained indefinitely by default
- Consider implementing archival policies for old data
- Regularly backup applicant data
- Implement GDPR-compliant deletion if required
