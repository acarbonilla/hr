# Geolocation-Based Application Tracking

## Overview

The system now automatically detects whether an applicant is applying from the office vicinity (walk-in) or remotely (online) using browser geolocation and geofencing technology.

## How It Works

### 1. **Applicant Registration**

When an applicant fills out the registration form:

- Browser requests location permission
- System captures latitude/longitude coordinates
- Location data is sent with registration form

### 2. **Distance Calculation**

Backend calculates distance using the **Haversine formula**:

```python
distance = calculate_distance(
    applicant_lat, applicant_lon,
    office_lat, office_lon
)
```

### 3. **Automatic Classification**

- **Within 500m of office** → Marked as "Walk-in"
- **Beyond 500m** → Marked as "Online"

### 4. **Data Storage**

Applicant model stores:

- `latitude` - Applicant's latitude
- `longitude` - Applicant's longitude
- `distance_from_office` - Distance in meters
- `application_source` - Auto-set to "walk_in" or "online"

---

## Configuration

### Office Location Settings

Update in `backend/core/geolocation_config.py`:

```python
OFFICE_COORDINATES = {
    'latitude': 14.5995,   # Your office latitude
    'longitude': 120.9842,  # Your office longitude
    'name': 'Head Office',
}

GEOFENCE_RADIUS_METERS = 500  # 500 meters (0.5 km)
```

### Multiple Branches

Add multiple office locations:

```python
OFFICE_BRANCHES = [
    {
        'name': 'Manila Head Office',
        'latitude': 14.5995,
        'longitude': 120.9842,
        'radius': 500,
    },
    {
        'name': 'Cebu Branch',
        'latitude': 10.3157,
        'longitude': 123.8854,
        'radius': 500,
    },
]
```

---

## Features

### Frontend (Registration Page)

**Location Detection Indicators:**

1. **Loading State** (Blue) - "Detecting your location..."
2. **Success State** (Green) - "Location detected successfully"
3. **Error State** (Yellow) - Shows error message, allows registration anyway

**User Experience:**

- Automatic detection on page load
- No manual input required
- Falls back gracefully if location blocked
- Still allows registration without location

### HR Dashboard (Applicants Page)

**New "Source" Column:**

- Shows "Walk-in" or "Online"
- Displays distance from office
  - Walk-in (250m)
  - Online (5.3km)
- Color-coded badges:
  - 🔵 Blue for Walk-in
  - ⚪ Gray for Online

---

## Technical Implementation

### Database Schema

```sql
-- Added fields to applicants table
ALTER TABLE applicants ADD COLUMN latitude DECIMAL(9,6);
ALTER TABLE applicants ADD COLUMN longitude DECIMAL(9,6);
ALTER TABLE applicants ADD COLUMN distance_from_office DECIMAL(10,2);
```

### API Updates

**POST /api/applicants/**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "latitude": 14.599,
  "longitude": 120.985
}
```

**Response includes:**

```json
{
  "application_source": "walk_in",
  "distance_from_office": 235.5,
  "latitude": 14.599,
  "longitude": 120.985
}
```

### Geolocation Utility (Frontend)

Located in `frontend/lib/geolocation.ts`:

```typescript
// Get current location
const location = await getCurrentLocation();

// Calculate distance
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Check if within geofence
const isWithinArea = isWithinGeofence(lat, lon, officeLat, officeLon, 500);
```

---

## Privacy & Security

### User Consent

- Browser prompts for location permission
- User can deny permission
- Registration still works without location
- Location only captured at registration time

### Data Storage

- Only stores coordinates at application time
- Does not track continuous location
- Coordinates stored for verification purposes
- Can be viewed only by HR admin

### Accuracy

- Typically accurate to 10-50 meters (GPS)
- Less accurate indoors (50-500 meters)
- Wi-Fi assisted for better accuracy
- Mobile devices more accurate than desktop

---

## Use Cases

### 1. Walk-in Applicants

**Scenario:** Person visits office to apply

- System detects they're within 500m
- Auto-marked as "Walk-in"
- HR knows they came physically to office

### 2. Remote Applicants

**Scenario:** Person applies from home

- System detects they're far from office
- Auto-marked as "Online"
- HR knows it's a remote application

### 3. Verification

**Scenario:** Applicant claims they came to office

- HR can check distance: "Walk-in (5.3km)"
- Clearly not at office location
- Helps identify false walk-in claims

---

## Troubleshooting

### Location Not Detected

**Common Issues:**

1. **Permission Denied** - User blocked location access
   - Solution: User must enable location in browser settings
2. **HTTPS Required** - Geolocation requires secure connection
   - Solution: Use HTTPS in production
3. **Location Unavailable** - GPS/Wi-Fi not available
   - Solution: System falls back to "Online" classification

### Wrong Classification

**If walk-in marked as online:**

1. Check office coordinates in config file
2. Verify geofence radius (default 500m)
3. Consider GPS accuracy (±50m typical)
4. Indoor locations may have poor GPS signal

**Solution:** Increase geofence radius to 1000m if needed:

```python
GEOFENCE_RADIUS_METERS = 1000  # 1 kilometer
```

---

## Testing

### Test Different Scenarios

**1. Test Walk-in (Mock Location):**

```typescript
// Frontend - simulate office location
const mockLocation = {
  latitude: 14.5995, // Office coordinates
  longitude: 120.9842,
};
```

**2. Test Online (Mock Location):**

```typescript
// Simulate remote location (1km away)
const mockLocation = {
  latitude: 14.6095,
  longitude: 120.9942,
};
```

**3. Test Without Permission:**

- Block location in browser
- Should show yellow warning
- Should still allow registration
- Should mark as "Online"

### Backend Testing

```python
# Test distance calculation
python manage.py shell

from applicants.models import Applicant

# Get applicant with location
app = Applicant.objects.get(id=1)
print(f"Distance: {app.distance_from_office}m")
print(f"Source: {app.application_source}")
print(f"Coords: {app.latitude}, {app.longitude}")
```

---

## Benefits

### For HR/Recruiters

1. **Accurate Tracking** - Know exactly where applicants applied from
2. **Walk-in Verification** - Verify physical presence at office
3. **Statistics** - Track walk-in vs online application rates
4. **Fraud Prevention** - Detect false walk-in claims

### For Applicants

1. **No Manual Input** - Automatic detection
2. **Privacy Respected** - Must grant permission
3. **Flexible** - Can still apply without location
4. **Transparent** - Clear indicators of what's happening

---

## Future Enhancements

### Possible Improvements:

1. **Map View** - Show applicant locations on map
2. **Multi-branch Support** - Auto-detect nearest branch
3. **Geofence Alerts** - Notify when walk-in applies
4. **Location History** - Track if applicant moves during interview
5. **IP Geolocation Fallback** - Use IP if GPS unavailable

---

## Migration Steps

### 1. Update Office Coordinates

```bash
# Edit backend/core/geolocation_config.py
OFFICE_COORDINATES = {
    'latitude': YOUR_LATITUDE,
    'longitude': YOUR_LONGITUDE,
}
```

### 2. Test Location Detection

```bash
# Visit registration page
# Check console for location data
# Verify distance calculation
```

### 3. Adjust Geofence if Needed

```python
# If 500m too strict, increase to 1000m
GEOFENCE_RADIUS_METERS = 1000
```

---

## API Reference

### Get Applicants with Location

```bash
GET /api/applicants/
```

Response includes location data:

```json
{
  "results": [
    {
      "id": 1,
      "full_name": "John Doe",
      "application_source": "walk_in",
      "latitude": 14.599,
      "longitude": 120.985,
      "distance_from_office": 235.5
    }
  ]
}
```

---

## Support

### Getting Office Coordinates

**Option 1: Google Maps**

1. Open Google Maps
2. Find your office
3. Right-click → "What's here?"
4. Copy coordinates

**Option 2: GPS Device**

- Use smartphone GPS app
- Stand at office entrance
- Copy latitude/longitude

**Format:** Decimal degrees (e.g., 14.5995, 120.9842)

---

_Last Updated: November 14, 2025_
