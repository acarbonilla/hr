# Position-Based Interview Questions System

## Overview

HireNowPro now supports organizing interview questions by **position type** in addition to **question type**. This allows you to create tailored interview experiences for different job roles.

## Position Types

The system supports 5 position categories:

| Code                | Display Name        | Use Case                                                     |
| ------------------- | ------------------- | ------------------------------------------------------------ |
| `virtual_assistant` | Virtual Assistant   | Executive support, calendar management, administrative tasks |
| `customer_service`  | Customer Service    | Customer support, client relations, problem resolution       |
| `it_support`        | IT Support          | Technical support, troubleshooting, system administration    |
| `sales_marketing`   | Sales and Marketing | Sales, business development, marketing campaigns             |
| `general`           | General             | Universal questions applicable to all positions              |

## Question Type vs Position Type

### Question Type (Nature of Question)

- **Technical:** Skills, tools, technical knowledge
- **Behavioral:** Past experiences, real examples
- **Situational:** Hypothetical scenarios
- **General:** Open-ended, personality, career goals

### Position Type (Job Role)

- **Virtual Assistant, Customer Service, IT Support, Sales & Marketing, General**

**Example Combinations:**

- Technical + IT Support = "What operating systems are you experienced with?"
- Behavioral + Customer Service = "Describe a time you helped an angry customer"
- Situational + Virtual Assistant = "How would you prioritize tasks from multiple executives?"

## Database Schema

```python
class InterviewQuestion(models.Model):
    question_text = models.TextField()
    question_type = models.CharField(choices=QUESTION_TYPE_CHOICES)  # technical, behavioral, situational, general
    position_type = models.CharField(choices=POSITION_TYPE_CHOICES)  # virtual_assistant, customer_service, etc.
    max_duration = models.DurationField()
    is_active = models.BooleanField(default=True)
    order = models.IntegerField()
```

## API Usage

### List All Questions

```http
GET /api/questions/
```

**Response:**

```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "question_text": "Tell us about yourself...",
      "question_type": "general",
      "position_type": "general",
      "order": 1
    }
  ]
}
```

### Filter by Position Type

```http
GET /api/questions/?position=virtual_assistant
```

**Response:** Only Virtual Assistant questions

### Filter by Question Type

```http
GET /api/questions/?type=behavioral
```

**Response:** Only behavioral questions

### Combine Filters

```http
GET /api/questions/?position=customer_service&type=situational
```

**Response:** Situational questions for customer service

## Django Admin

HR can manage questions through Django Admin:

1. Navigate to: `http://localhost:8000/admin/interviews/interviewquestion/`
2. **List View** shows: Question text, Position type, Question type, Order, Active status
3. **Filters** available: Position type, Question type, Active status
4. **Search:** By question text
5. **Bulk Edit:** Order and Active status

### Admin Features:

- **Fieldsets:** Organized sections for Question Details and Display Settings
- **List Display:** Shows position_type prominently
- **List Filters:** Easy filtering by position and question type
- **Inline Editing:** Change order and active status directly in list view

## Management Commands

### Create Sample Questions

```bash
# Create questions for all positions
python manage.py create_position_questions

# Create questions for specific position
python manage.py create_position_questions --position=virtual_assistant
python manage.py create_position_questions --position=customer_service
python manage.py create_position_questions --position=it_support
python manage.py create_position_questions --position=sales_marketing
python manage.py create_position_questions --position=general
```

**Output:**

```
Processing Virtual Assistant questions...
  ✓ Created: Describe your experience with managing calendars...
  ✓ Created: How do you prioritize tasks when handling multiple...

✓ Summary:
  Created: 25 questions

  Breakdown by position:
    • Virtual Assistant: 5 questions
    • Customer Service: 5 questions
    • IT Support: 5 questions
    • Sales and Marketing: 5 questions
    • General: 7 questions
```

## Frontend Integration

### Applicant Registration Flow

When applicant registers, they can specify their position:

```typescript
// In registration form
const [applicantData, setApplicantData] = useState({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position_applying_for: "virtual_assistant", // New field
});
```

### Fetch Position-Specific Questions

```typescript
// Get questions for specific position
const response = await questionAPI.getQuestionsByPosition("virtual_assistant");

// Or in the API client:
export const questionAPI = {
  getQuestions: () => api.get("/questions/"),

  getQuestionsByPosition: (position: string) => api.get(`/questions/?position=${position}`),

  getQuestionsByType: (type: string) => api.get(`/questions/?type=${type}`),
};
```

### Interview Creation with Position

```typescript
// Create interview with position-specific questions
const createInterview = async (applicantId: number, position: string) => {
  // Create interview
  const interview = await interviewAPI.createInterview({
    applicant_id: applicantId,
    interview_type: "initial_ai",
  });

  // Fetch position-specific questions
  const questions = await questionAPI.getQuestionsByPosition(position);

  return { interview, questions };
};
```

## Sample Questions Created

### Virtual Assistant (5 questions)

1. Describe your experience with managing calendars, scheduling meetings...
2. How do you prioritize tasks when handling multiple requests...
3. What tools and software are you proficient in for document management...
4. Tell us about a time when you had to handle a difficult or urgent request...
5. How do you maintain organization and efficiency while working independently...

### Customer Service (5 questions)

1. Describe a situation where you turned an unhappy customer into a satisfied one...
2. How would you handle a customer who is upset about a problem...
3. What customer service software or CRM systems have you used...
4. How do you stay patient and professional when dealing with difficult customers...
5. What does excellent customer service mean to you?

### IT Support (5 questions)

1. Walk us through your troubleshooting process when a user reports...
2. Describe a time when you had to explain a complex technical issue...
3. How would you prioritize multiple IT support tickets...
4. What operating systems, hardware, and software are you most experienced with...
5. How do you stay updated with the latest technology trends...

### Sales and Marketing (5 questions)

1. Describe your most successful sales achievement...
2. How would you approach selling our product/service to a skeptical customer...
3. What digital marketing tools and platforms are you proficient in...
4. Tell us about a marketing campaign you created or contributed to...
5. How do you handle rejection in sales...

### General (7 questions)

1. Tell us about yourself and why you are interested in this position
2. Describe a challenging situation at work and how you overcame it
3. How do you manage your time and stay productive when working remotely
4. What are your strengths and how will they benefit our company
5. Where do you see yourself in 3-5 years

## Database Migration

Migration `0004_add_position_type_to_questions.py` adds:

- `position_type` field to InterviewQuestion model
- Default value: `'general'`
- Max length: 30 characters
- Choices: 5 position types

**Already applied:** ✅

## Use Cases

### 1. Position-Specific Interview

```python
# Applicant applies for Virtual Assistant position
questions = InterviewQuestion.objects.filter(
    position_type='virtual_assistant',
    is_active=True
).order_by('order')
```

### 2. Mixed Interview (General + Position-Specific)

```python
from django.db.models import Q

# Get general questions + position-specific
questions = InterviewQuestion.objects.filter(
    Q(position_type='general') | Q(position_type='customer_service'),
    is_active=True
).order_by('order')
```

### 3. Question Bank Management

```python
# Count questions per position
for position in ['virtual_assistant', 'customer_service', 'it_support', 'sales_marketing', 'general']:
    count = InterviewQuestion.objects.filter(position_type=position).count()
    print(f"{position}: {count} questions")
```

### 4. Create Custom Questions

```python
InterviewQuestion.objects.create(
    question_text="How do you handle multiple chat conversations simultaneously?",
    question_type='situational',
    position_type='customer_service',
    max_duration=timedelta(minutes=2),
    order=6,
    is_active=True
)
```

## Best Practices

1. **Always include General questions:** Mix position-specific with general questions for balanced interview
2. **Order matters:** Set appropriate `order` values (1, 2, 3...) for question sequence
3. **Max duration:** Typically 2 minutes for most questions, 3 minutes for complex technical questions
4. **Question variety:** Mix question types (technical, behavioral, situational) within each position
5. **Keep active:** Use `is_active=False` instead of deleting questions to maintain data integrity

## Future Enhancements

### Planned Features:

- [ ] Allow applicants to select position during registration
- [ ] Dynamic question selection based on position
- [ ] Question difficulty levels (easy, medium, hard)
- [ ] Multi-position support (e.g., both Virtual Assistant and Customer Service)
- [ ] Question tags for advanced filtering
- [ ] Question usage statistics (which questions perform best)

## Testing

### Test Position Filter

```bash
# In Django shell
python manage.py shell

>>> from interviews.models import InterviewQuestion
>>> InterviewQuestion.objects.filter(position_type='virtual_assistant').count()
5
```

### Test API Endpoint

```bash
curl http://localhost:8000/api/questions/?position=virtual_assistant
```

### Test in Frontend

```typescript
const response = await fetch("http://localhost:8000/api/questions/?position=customer_service");
const data = await response.json();
console.log(`Found ${data.count} customer service questions`);
```

## Summary

✅ **Position types added:** 5 (Virtual Assistant, Customer Service, IT Support, Sales & Marketing, General)  
✅ **Sample questions created:** 25 total (5 per position)  
✅ **API filtering enabled:** `?position=` and `?type=` parameters  
✅ **Admin interface updated:** Position type in list view and filters  
✅ **Management command:** `create_position_questions` for easy setup  
✅ **Database migrated:** New `position_type` field added

The system is ready for position-based interviews! 🚀
