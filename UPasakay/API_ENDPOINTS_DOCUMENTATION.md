# UPasakay Driver & Shuttle API Documentation

## Overview

This document describes the three new API endpoints added to the UPasakay mobile application backend:
1. Active Shuttle & Route Details API
2. Driver Live Location Updates API  
3. Driver Trip Status Updates API

These endpoints enable real-time tracking of shuttles and drivers, as well as live location sharing for the mobile app.

---

## 1. Active Shuttle & Route Details API

### Purpose
Provides the mobile app with currently active shuttle information, including assigned driver, route, and trip metadata. This allows passengers to see which shuttle is serving their route.

### Endpoints

#### Get Single Active Shuttle
```
GET /api/shuttle/active
GET /api/shuttle/active?route_id=1
```

**Authentication:** Required (`auth:sanctum`)

**Query Parameters:**
- `route_id` (optional): Filter by specific route ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Active shuttle retrieved successfully",
  "data": {
    "shuttle": {
      "id": 1,
      "code": "SHT001",
      "plate_number": "ABC-123",
      "type": "van",
      "capacity": 15,
      "status": "active",
      "is_active": true
    },
    "driver": {
      "id": 1,
      "full_name": "John Doe",
      "license_number": "DL123456",
      "status": "active",
      "is_available": true
    },
    "route": {
      "id": 1,
      "name": "North Campus Loop",
      "start_location": "Main Gate",
      "end_location": "Engineering Building",
      "distance_km": 5.2,
      "estimated_duration_minutes": 15,
      "is_active": true,
      "stops": [
        {
          "id": 1,
          "name": "Main Gate",
          "latitude": 14.6349,
          "longitude": 121.0450,
          "sequence": 1
        },
        {
          "id": 2,
          "name": "Science Building",
          "latitude": 14.6352,
          "longitude": 121.0455,
          "sequence": 2
        }
      ]
    },
    "last_location": {
      "latitude": 14.6351,
      "longitude": 121.0453,
      "speed_kmh": 12.5,
      "recorded_at": "2026-04-24T10:30:00Z"
    },
    "last_seen_at": "2026-04-24T10:30:00Z",
    "updated_at": "2026-04-24T10:30:00Z"
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No active shuttle found",
  "data": null
}
```

#### Get All Active Shuttles
```
GET /api/shuttle/active/all
```

**Authentication:** Required (`auth:sanctum`)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Active shuttles retrieved successfully",
  "data": [
    {
      "id": 1,
      "code": "SHT001",
      "plate_number": "ABC-123",
      "type": "van",
      "capacity": 15,
      "status": "active",
      "driver": {
        "id": 1,
        "full_name": "John Doe",
        "status": "active"
      },
      "route": {
        "id": 1,
        "name": "North Campus Loop"
      }
    }
  ]
}
```

**Acceptance Criteria Met:**
- ✅ API returns only active shuttle records (where `is_active = true` and `status != 'offline'`)
- ✅ Response includes shuttle ID, route details, driver info, and status
- ✅ API returns 404 when no active shuttle exists
- ✅ Response format is consistent and documented

---

## 2. Driver Live Location Updates API

### Purpose
Allows drivers to send their current GPS location while on duty. The latest location is saved and retrievable by the frontend for real-time tracking.

### Endpoints

#### Update Driver Location
```
POST /api/mobile/driver/location/update
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Request Body:**
```json
{
  "latitude": 14.6349,
  "longitude": 121.0450,
  "speed_kmh": 25.5,
  "timestamp": "2026-04-24 10:30:00"
}
```

**Parameters:**
- `latitude` (required): Float between -90 and 90 (supports up to 8 decimal places)
- `longitude` (required): Float between -180 and 180 (supports up to 8 decimal places)
- `speed_kmh` (optional): Numeric, 0-300 km/h
- `timestamp` (optional): ISO date format, must not be in the future (defaults to current time)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "location_id": 123,
    "shuttle_id": 1,
    "latitude": 14.6349,
    "longitude": 121.0450,
    "speed_kmh": 25.5,
    "recorded_at": "2026-04-24T10:30:00Z",
    "saved_at": "2026-04-24T10:30:15Z"
  }
}
```

**Validation Errors (422 Unprocessable Entity):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "latitude": ["Latitude must be between -90 and 90"],
    "longitude": ["Longitude must be between -180 and 180"],
    "speed_kmh": ["Speed cannot exceed 300 km/h"]
  }
}
```

**Authorization Error (401/403):**
```json
{
  "success": false,
  "message": "Unauthorized. Driver authentication required."
}
```

#### Get Latest Location
```
GET /api/mobile/driver/location/latest
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Latest location retrieved",
  "data": {
    "location_id": 123,
    "shuttle_id": 1,
    "latitude": 14.6349,
    "longitude": 121.0450,
    "speed_kmh": 25.5,
    "recorded_at": "2026-04-24T10:30:00Z"
  }
}
```

#### Batch Upload Locations
```
POST /api/mobile/driver/location/batch
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Request Body:**
```json
{
  "locations": [
    {
      "latitude": 14.6349,
      "longitude": 121.0450,
      "speed_kmh": 25.5,
      "timestamp": "2026-04-24 10:30:00"
    },
    {
      "latitude": 14.6350,
      "longitude": 121.0451,
      "speed_kmh": 26.0,
      "timestamp": "2026-04-24 10:31:00"
    }
  ]
}
```

**Parameters:**
- `locations` (required): Array of location objects (1-50 locations per batch)
- Each location object has same parameters as single update endpoint

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "2 locations saved successfully",
  "data": {
    "shuttle_id": 1,
    "locations_saved": 2,
    "latest_location": {
      "latitude": 14.6350,
      "longitude": 121.0451,
      "recorded_at": "2026-04-24T10:31:00Z"
    }
  }
}
```

**Acceptance Criteria Met:**
- ✅ API accepts latitude, longitude, and timestamp
- ✅ Only authenticated driver accounts can send location updates
- ✅ Latest location is saved and can be retrieved
- ✅ Invalid coordinates are rejected with proper validation errors

---

## 3. Driver Trip Status Updates API

### Purpose
Enables drivers to update their current trip state (idle, en route, arrived, completed). Status updates are stored and readable by passenger-facing screens.

### Valid Trip Statuses
- `idle`: Trip started but driver not yet en route
- `en_route`: Driver is actively transporting passengers
- `arrived`: Driver has arrived at destination
- `completed`: Trip is finished

### Endpoints

#### Start Trip
```
POST /api/mobile/driver/trip/start
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Request Body:**
```json
{
  "shuttle_id": 1,
  "route_id": 1
}
```

**Parameters:**
- `shuttle_id` (required): Valid shuttle ID
- `route_id` (required): Valid route ID

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Trip started successfully",
  "data": {
    "trip_id": 1,
    "driver_id": 1,
    "shuttle_id": 1,
    "route_id": 1,
    "status": "idle",
    "created_at": "2026-04-24T10:30:00Z"
  }
}
```

**Conflict Response (409):**
```json
{
  "success": false,
  "message": "Driver already has an active trip."
}
```

#### Update Trip Status
```
POST /api/mobile/driver/trip/status
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Request Body:**
```json
{
  "status": "en_route",
  "notes": "Picked up passengers at stop 1"
}
```

**Parameters:**
- `status` (required): One of: `idle`, `en_route`, `arrived`, `completed`
- `notes` (optional): Additional information (max 255 characters)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip status updated successfully",
  "data": {
    "trip_id": 1,
    "driver_id": 1,
    "shuttle_id": 1,
    "route_id": 1,
    "previous_status": "idle",
    "current_status": "en_route",
    "started_at": "2026-04-24T10:30:00Z",
    "completed_at": null,
    "updated_at": "2026-04-24T10:32:00Z"
  }
}
```

**Validation Error (422):**
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "status": ["Invalid status. Valid values are: idle, en_route, arrived, completed"]
  }
}
```

#### Get Current Trip
```
GET /api/mobile/driver/trip/current
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Current trip retrieved",
  "data": {
    "trip_id": 1,
    "driver_id": 1,
    "shuttle": {
      "id": 1,
      "code": "SHT001",
      "plate_number": "ABC-123"
    },
    "route": {
      "id": 1,
      "name": "North Campus Loop",
      "start_location": "Main Gate",
      "end_location": "Engineering Building"
    },
    "status": "en_route",
    "started_at": "2026-04-24T10:30:00Z",
    "completed_at": null,
    "created_at": "2026-04-24T10:30:00Z",
    "updated_at": "2026-04-24T10:32:00Z"
  }
}
```

#### End Trip
```
POST /api/mobile/driver/trip/end
```

**Authentication:** Required (`auth:sanctum`) - Driver account only

**Request Body:** (empty)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip ended successfully",
  "data": {
    "trip_id": 1,
    "status": "completed",
    "completed_at": "2026-04-24T10:45:00Z"
  }
}
```

#### Get Trip Status (Public)
```
GET /api/trip/{tripId}/status
```

**Authentication:** Not required (public endpoint for passengers)

**Parameters:**
- `tripId` (required): Trip ID (path parameter)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Trip status retrieved",
  "data": {
    "trip_id": 1,
    "driver": {
      "id": 1,
      "full_name": "John Doe"
    },
    "shuttle": {
      "id": 1,
      "plate_number": "ABC-123"
    },
    "route": {
      "id": 1,
      "name": "North Campus Loop"
    },
    "status": "en_route",
    "started_at": "2026-04-24T10:30:00Z",
    "completed_at": null
  }
}
```

**Acceptance Criteria Met:**
- ✅ API accepts valid trip status values only
- ✅ Status updates are stored successfully
- ✅ Passenger-facing screens can read updated status (public endpoint)
- ✅ Invalid status values are rejected

---

## Database Schema

### Trips Table
```sql
CREATE TABLE trips (
    id BIGINT PRIMARY KEY,
    driver_id BIGINT NOT NULL (FK: drivers.id),
    shuttle_id BIGINT NOT NULL (FK: shuttles.id),
    route_id BIGINT NOT NULL (FK: routes.id),
    status ENUM('idle', 'en_route', 'arrived', 'completed') DEFAULT 'idle',
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    KEY (driver_id, status),
    KEY (shuttle_id, status)
);
```

---

## Authentication

All driver endpoints require Sanctum token authentication:

```bash
# Authenticate as driver
POST /api/login
{
  "email": "driver@example.com",
  "password": "password"
}

# Add token to Authorization header
Authorization: Bearer {token}
```

---

## Error Handling

### Common HTTP Status Codes
- **200 OK**: Successful GET or status update
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Invalid request format
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User is authenticated but not a driver
- **404 Not Found**: Resource not found
- **409 Conflict**: Conflict (e.g., duplicate active trip)
- **422 Unprocessable Entity**: Validation error

---

## Implementation Notes

1. **Location Precision**: Coordinates support up to 8 decimal places for high precision (approximately 1.1mm accuracy)

2. **Timestamp Handling**: If timestamp not provided, current server time is used automatically

3. **Shuttle Assignment**: Driver must have an active shuttle assignment to send locations

4. **Trip Lifecycle**: 
   - Driver starts trip (status: idle)
   - Driver updates status to en_route
   - Driver updates status to arrived
   - Driver completes trip

5. **Real-time Updates**: Use WebSocket or polling to fetch latest shuttle location and trip status

6. **Rate Limiting**: Recommend implementing rate limiting for location updates (e.g., 1 update per second per driver)

---

## Testing

### Example cURL Commands

```bash
# Get active shuttle
curl -X GET http://localhost:8000/api/shuttle/active \
  -H "Authorization: Bearer {token}"

# Update driver location
curl -X POST http://localhost:8000/api/mobile/driver/location/update \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 14.6349,
    "longitude": 121.0450,
    "speed_kmh": 25.5
  }'

# Update trip status
curl -X POST http://localhost:8000/api/mobile/driver/trip/status \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "en_route"
  }'

# Get trip status (public)
curl -X GET http://localhost:8000/api/trip/1/status
```

---

## Migration Steps

To enable these APIs, run the database migration:

```bash
php artisan migrate
```

This creates the new `trips` table with proper indexes and foreign keys.
