# Position Management Guide

## Adding Positions from HR Dashboard

### Overview

HR Managers and Recruiters can now manage job positions directly from the HR Dashboard. This allows you to:

- Create new positions
- Edit existing positions
- Toggle position active/inactive status
- Delete positions
- Configure display order

---

## Access Position Management

### Navigation

1. Log in to HR Dashboard at `/hr-login`
2. Click **"Positions"** in the left sidebar (💼 icon)
3. You'll see the Position Management page

### URL

Direct access: `http://localhost:3000/hr-dashboard/positions`

---

## Managing Positions

### 1. View All Positions

The main page displays a table with:

- **Order**: Display sequence
- **Code**: Unique identifier (used in backend)
- **Name**: Display name shown to applicants
- **Description**: Position details
- **Status**: Active/Inactive toggle
- **Actions**: Edit/Delete buttons

### 2. Add New Position

**Steps:**

1. Click **"Add Position"** button (top-right)
2. Fill in the form:

   - **Position Code** (required, unique)

     - Example: `IT`, `virtual-assistant`, `customer-service`
     - Cannot be changed after creation
     - Used in backend and URLs

   - **Position Name** (required)

     - Example: `IT Support Specialist`, `Virtual Assistant`
     - Displayed to applicants

   - **Description** (optional)

     - Brief description of the role

   - **Display Order** (number)

     - Controls order in lists (0 = first)

   - **Status** (Active/Inactive)
     - Only active positions shown to applicants

3. Click **"Create Position"**

**Example:**

```
Code: IT
Name: IT Support Specialist
Description: Provide technical support and troubleshooting
Order: 4
Status: Active
```

### 3. Edit Existing Position

**Steps:**

1. Click the **Edit icon** (✏️) next to any position
2. Modify the fields (except Code)
3. Click **"Update Position"**

**Note:** Position Code cannot be changed to prevent breaking existing data relationships.

### 4. Toggle Active Status

**Quick Toggle:**

- Click the **Active/Inactive** badge in the Status column
- Position immediately toggles between active/inactive
- Inactive positions hidden from applicant view

**Use Cases:**

- Temporarily close a position
- Seasonal hiring
- Testing new positions

### 5. Delete Position

**Steps:**

1. Click the **Delete icon** (🗑️) next to the position
2. Confirm deletion in the popup
3. Position is permanently removed

**⚠️ Warning:**

- Deletion affects existing interviews using this position
- Use "Inactive" status instead if you want to preserve data

---

## Integration with Recruitment Flow

### How Positions Appear to Applicants

1. **Open Positions Page** (`/positions`)

   - Shows all **active** positions
   - Each position displays name, description, requirements
   - Applicants click "Apply Now" to start

2. **Position Selection**
   - Position ID passed through registration
   - Interview auto-created for selected position
   - Streamlined application process

### Position Code Mapping

The **Position Code** must match what's used in the backend:

| Code           | Usage                 |
| -------------- | --------------------- |
| `VA`           | Virtual Assistant     |
| `DE`           | Data Entry Specialist |
| `CS`           | Customer Support      |
| `IT`           | IT Support Specialist |
| `social-media` | Social Media Manager  |

**Important:** When adding positions in HR Dashboard, use the same codes that exist in your frontend `/positions` page.

---

## API Endpoints

### Backend API

The position management page uses these endpoints:

```
GET    /api/interviews/position-types/     # List all positions
POST   /api/interviews/position-types/     # Create new position
GET    /api/interviews/position-types/:id/ # Get position details
PUT    /api/interviews/position-types/:id/ # Update position
PATCH  /api/interviews/position-types/:id/ # Partial update
DELETE /api/interviews/position-types/:id/ # Delete position
```

### Authentication

- Requires HR authentication token
- Only HR Managers and HR Recruiters have access
- IT Support users cannot access

---

## Best Practices

### Naming Conventions

**Position Codes:**

- Use lowercase with hyphens
- Short and descriptive
- Examples: `it-support`, `virtual-assistant`, `data-entry`

**Position Names:**

- Use proper capitalization
- Professional titles
- Examples: `IT Support Specialist`, `Virtual Assistant`

### Display Order

Organize positions logically:

```
0: Virtual Assistant (most popular)
1: Customer Service Representative
2: Data Entry Specialist
3: IT Support Specialist
4: Social Media Manager
```

### Status Management

- **Active**: Position accepting applications
- **Inactive**: Position closed but data preserved

Use inactive for:

- Seasonal positions (activate when needed)
- Testing new positions before launch
- Pausing hiring temporarily

---

## Synchronizing with Frontend

### Current Setup

**Backend:** Positions stored in `PositionType` model
**Frontend:** Static positions in `/app/positions/page.tsx`

### To Fully Integrate:

1. **Fetch from API** in frontend positions page:

```typescript
const [positions, setPositions] = useState([]);

useEffect(() => {
  const fetchPositions = async () => {
    const response = await fetch("/api/interviews/position-types/");
    const data = await response.json();
    setPositions(data.filter((p) => p.is_active));
  };
  fetchPositions();
}, []);
```

2. **Update position cards** to use API data:

```typescript
{
  positions.map((position) => (
    <PositionCard key={position.id} code={position.code} name={position.name} description={position.description} />
  ));
}
```

3. **Benefits:**
   - HR adds position → Immediately visible to applicants
   - No code changes needed for new positions
   - Centralized position management

---

## Troubleshooting

### Position Not Appearing on Frontend

**Checklist:**

1. ✅ Position status is **Active**
2. ✅ Position has a valid **Code**
3. ✅ Frontend is fetching from API (not static data)
4. ✅ No browser cache issues (hard refresh)

### Cannot Delete Position

**Reasons:**

- Position linked to existing interviews
- Database foreign key constraints

**Solution:**

- Set position to **Inactive** instead
- Or check with IT to remove dependencies first

### Code Already Exists Error

**Cause:** Position codes must be unique

**Solution:**

- Use a different code
- Check if position already exists
- Delete old position first (if unused)

---

## Summary

**Key Features:**
✅ Add/Edit/Delete positions from HR Dashboard
✅ Toggle active/inactive status
✅ Configure display order
✅ Integration with recruitment flow
✅ Real-time updates

**Access:**

- Navigate to: **HR Dashboard > Positions**
- Or visit: `/hr-dashboard/positions`

**Permissions:**

- HR Manager ✅
- HR Recruiter ✅
- IT Support ❌
- Applicants ❌

---

## Related Files

### Frontend

- `/app/hr-dashboard/positions/page.tsx` - Position management UI
- `/app/positions/page.tsx` - Public positions listing
- `/app/hr-dashboard/layout.tsx` - Navigation menu

### Backend

- `backend/interviews/type_models.py` - PositionType model
- `backend/interviews/views.py` - PositionTypeViewSet API
- `backend/interviews/urls.py` - API routing
- `backend/interviews/type_serializers.py` - API serializers

### Documentation

- `POSITION_FIRST_RECRUITMENT_FLOW.md` - Overall recruitment flow
- `POSITION_SELECTION_FLOW.md` - Original position selection
