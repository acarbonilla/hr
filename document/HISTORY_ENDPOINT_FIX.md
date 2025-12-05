# History Endpoint Fix

## Issue

The applicant history endpoint (`/api/applicants/history/`) was returning a 500 error when accessed from the frontend.

## Root Cause

The error was in `applicants/serializers_history.py` in the `ApplicantHistorySerializer` class:

```python
# ❌ INCORRECT - Redundant source parameter
full_name = serializers.CharField(source='full_name', read_only=True)
```

Django REST Framework throws an `AssertionError` when a field specifies a `source` parameter that matches the field name itself, as it's redundant.

## Error Message

```
AssertionError: It is redundant to specify `source='full_name'` on field 'CharField'
in serializer 'ApplicantHistorySerializer', because it is the same as the field name.
Remove the `source` keyword argument.
```

## Solution

Removed the redundant `source` parameter:

```python
# ✅ CORRECT
full_name = serializers.CharField(read_only=True)
```

## Files Modified

- `backend/applicants/serializers_history.py` (line 71)

## Testing

After the fix, the endpoint now works correctly:

```bash
curl http://localhost:8000/api/applicants/history/
```

Returns:

```json
{
  "count": 19,
  "total_pages": 1,
  "current_page": 1,
  "page_size": 25,
  "results": [...]
}
```

## Status

✅ **RESOLVED** - The history endpoint is now fully functional and ready for frontend use.

## Related Features

- Applicant history listing with filters
- Search and pagination
- CSV export functionality
- Detailed history view for individual applicants

## Date

November 17, 2025
