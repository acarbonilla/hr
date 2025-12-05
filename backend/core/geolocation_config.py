"""
Geolocation configuration for office location and geofencing
"""
import os

# Office coordinates - Can be configured via environment variables or directly in code
OFFICE_COORDINATES = {
    'latitude': float(os.getenv('OFFICE_LATITUDE', '14.5995')),  # Example: Manila, Philippines
    'longitude': float(os.getenv('OFFICE_LONGITUDE', '120.9842')),
    'name': os.getenv('OFFICE_NAME', 'Head Office'),
}

# Geofence radius in meters
# Applicants within this radius will be marked as "walk_in"
# Applicants outside will be marked as "online"
GEOFENCE_RADIUS_METERS = int(os.getenv('GEOFENCE_RADIUS', '500'))  # 500 meters (0.5 km)

# Alternative office locations (if you have multiple branches)
OFFICE_BRANCHES = [
    {
        'name': 'Cebu Head Office',
        'latitude': 10.33308,
        'longitude': 123.9476,
        'radius': 200,
    },
    # Add more branches as needed:
    # {
    #     'name': 'Cebu Branch',
    #     'latitude': 10.3157,
    #     'longitude': 123.8854,
    #     'radius': 500,
    # },
]
