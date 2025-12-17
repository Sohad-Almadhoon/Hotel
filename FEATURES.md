# Room Booking Management System - Features Documentation

## Overview

This document provides a detailed breakdown of all features implemented in the Room Booking Management System.

## 🔐 Authentication & Authorization

### User Roles

#### 1. GUEST
- Can browse and search rooms
- Can make bookings
- Can view own bookings
- Can cancel own bookings
- **Cannot**: Create rooms, access admin features

#### 2. OWNER
- Can create and manage rooms
- Can view bookings for their rooms
- Can update room details (price, capacity, status)
- Can delete rooms (if no active bookings)
- **Cannot**: Book rooms, access admin features

#### 3. ADMIN
- Full system access
- Can view all users, rooms, and bookings
- Can update booking statuses
- Can delete users (with validation)
- Can access dashboard statistics
- **Cannot**: Delete themselves

### Authentication Features

✅ **JWT-based authentication**
- Token expires after 7 days
- Secure password hashing with bcrypt
- Bearer token format

✅ **Registration validation**
- Email format validation
- Password minimum length (6 characters)
- Unique email constraint
- Role selection (OWNER, GUEST, ADMIN)

✅ **Login security**
- Credential verification
- Error handling for invalid credentials
- Automatic token generation

## 🏠 Room Management

### Features for Owners

#### Create Room
```javascript
POST /api/rooms
{
  "name": "Deluxe Suite",
  "description": "Luxurious room with ocean view",
  "price": 200.50,
  "capacity": 4,
  "status": "AVAILABLE"
}
```

**Validations:**
- Name is required
- Price must be positive number
- Capacity must be at least 1
- Status: AVAILABLE or UNAVAILABLE
- Owner ID automatically assigned

#### Update Room
```javascript
PUT /api/rooms/:id
{
  "price": 250.00,
  "status": "UNAVAILABLE"
}
```

**Business Rules:**
- Only room owner can update
- Partial updates supported
- All fields are optional in update

#### Delete Room
```javascript
DELETE /api/rooms/:id
```

**Business Rules:**
- Only room owner can delete
- Cannot delete if active bookings exist (PENDING or CONFIRMED)
- Cascade delete for cancelled bookings

#### View My Rooms
```javascript
GET /api/rooms/my-rooms
```

**Returns:**
- All rooms owned by current user
- Includes active booking information
- Guest details for each booking

### Features for All Users

#### Browse Rooms
```javascript
GET /api/rooms
```

**Available Filters:**

1. **Price Range**
   ```
   GET /api/rooms?minPrice=100&maxPrice=300
   ```

2. **Capacity Range**
   ```
   GET /api/rooms?minCapacity=2&maxCapacity=4
   ```

3. **Status Filter**
   ```
   GET /api/rooms?status=AVAILABLE
   ```

4. **Date Availability** (Smart filtering)
   ```
   GET /api/rooms?checkIn=2025-01-01&checkOut=2025-01-05
   ```
   
   **Logic:**
   - Automatically excludes rooms with overlapping bookings
   - Only shows rooms available for entire date range
   - Considers only CONFIRMED and PENDING bookings

5. **Combined Filters**
   ```
   GET /api/rooms?minPrice=100&maxPrice=200&capacity=2&checkIn=2025-01-01&checkOut=2025-01-05
   ```

#### View Room Details
```javascript
GET /api/rooms/:id
```

**Returns:**
- Complete room information
- Owner details
- Active bookings (CONFIRMED and PENDING only)
- Timestamps

## 📅 Booking Management

### Features for Guests

#### Create Booking
```javascript
POST /api/bookings
{
  "roomId": "uuid",
  "checkIn": "2025-01-01T14:00:00Z",
  "checkOut": "2025-01-05T11:00:00Z"
}
```

**Validations:**

1. **Date Validations**
   - Check-out must be after check-in
   - Check-in cannot be in the past
   - Dates must be in ISO 8601 format

2. **Room Validations**
   - Room must exist
   - Room status must be AVAILABLE

3. **Overlap Prevention** (Critical Feature)
   - Checks for existing bookings in the date range
   - Prevents double bookings
   - Algorithm checks:
     ```
     - Booking starts before new booking ends AND
     - Booking ends after new booking starts
     ```
   - Only considers CONFIRMED and PENDING bookings
   - Returns 409 Conflict if overlap detected

4. **Status**
   - New bookings start with PENDING status
   - Can be updated to CONFIRMED by admin or owner

#### View My Bookings
```javascript
GET /api/bookings/my-bookings
GET /api/bookings/my-bookings?status=CONFIRMED
```

**Returns:**
- All bookings made by current user
- Room details included
- Owner contact information
- Filter by status (PENDING, CONFIRMED, CANCELLED)

#### Cancel Booking
```javascript
PATCH /api/bookings/:id/cancel
```

**Business Rules:**
- Only booking owner can cancel
- Cannot cancel already cancelled bookings
- Status changes to CANCELLED
- Room becomes available for those dates

### Features for Owners

#### View Room Bookings
```javascript
GET /api/bookings/room/:roomId
GET /api/bookings/room/:roomId?status=CONFIRMED
```

**Business Rules:**
- Only room owner can view
- Admins can also access
- Includes guest information
- Filter by booking status

## 👨‍💼 Admin Dashboard

### Statistics Endpoint
```javascript
GET /api/admin/stats
```

**Returns:**
```json
{
  "statistics": {
    "users": {
      "total": 50,
      "byRole": {
        "OWNER": 15,
        "GUEST": 30,
        "ADMIN": 5
      }
    },
    "rooms": {
      "total": 100,
      "available": 85,
      "unavailable": 15
    },
    "bookings": {
      "total": 200,
      "pending": 25,
      "confirmed": 150,
      "cancelled": 25
    }
  },
  "recentBookings": [...]
}
```

### User Management

#### Get All Users
```javascript
GET /api/admin/users
GET /api/admin/users?role=OWNER
```

**Returns:**
- All users with role filter option
- Includes booking and room counts
- Sorted by creation date

#### Delete User
```javascript
DELETE /api/admin/users/:id
```

**Business Rules:**
- Admin cannot delete themselves
- Cannot delete users with active bookings
- Cascade deletes for owned rooms (if no active bookings)

### Room Management

#### Get All Rooms
```javascript
GET /api/admin/rooms
GET /api/admin/rooms?status=AVAILABLE
```

**Returns:**
- All rooms in system
- Owner information
- Booking count per room

### Booking Management

#### Get All Bookings
```javascript
GET /api/admin/bookings
GET /api/admin/bookings?status=PENDING
```

**Returns:**
- All bookings system-wide
- Complete room and guest details
- Filter by status

#### Update Booking Status
```javascript
PATCH /api/admin/bookings/:id/status
{
  "status": "CONFIRMED"
}
```

**Valid Statuses:**
- PENDING → CONFIRMED
- PENDING → CANCELLED
- CONFIRMED → CANCELLED

## 🔍 Advanced Features

### 1. Overlap Prevention Algorithm

```javascript
// Checks if two date ranges overlap
const hasOverlap = (
  existingCheckIn,
  existingCheckOut,
  newCheckIn,
  newCheckOut
) => {
  return (
    (existingCheckIn <= newCheckIn && existingCheckOut > newCheckIn) ||
    (existingCheckIn < newCheckOut && existingCheckOut >= newCheckOut) ||
    (existingCheckIn >= newCheckIn && existingCheckOut <= newCheckOut)
  );
};
```

**Use Cases:**
- Creating new bookings
- Filtering available rooms by date
- Preventing double bookings

### 2. Smart Room Availability

When querying rooms with date range:
1. Fetches all matching rooms
2. Includes their bookings in date range
3. Filters out rooms with overlapping bookings
4. Returns only truly available rooms

**Example Query:**
```sql
SELECT * FROM rooms
WHERE price BETWEEN 100 AND 200
AND capacity >= 2
AND NOT EXISTS (
  SELECT 1 FROM bookings
  WHERE bookings.roomId = rooms.id
  AND bookings.status IN ('CONFIRMED', 'PENDING')
  AND (checkIn, checkOut) OVERLAPS (requestedCheckIn, requestedCheckOut)
)
```

### 3. Permission System

**Layered Authorization:**

1. **Authentication Middleware**
   - Verifies JWT token
   - Attaches user to request

2. **Authorization Middleware**
   - Checks user role
   - Returns 403 if insufficient permissions

3. **Resource-Level Checks**
   - Verifies ownership (e.g., can only update own rooms)
   - Prevents cross-user data access

**Example Flow:**
```
Request → Authenticate → Authorize(OWNER) → Check Room Ownership → Allow/Deny
```

### 4. Data Integrity

**Timestamps:**
- Every entity has `createdAt` and `updatedAt`
- Automatically managed by Prisma
- Useful for auditing and sorting

**Cascade Rules:**
- Deleting user → Deletes owned rooms (if no active bookings)
- Deleting room → Deletes all bookings
- Deleting user → Deletes all made bookings

**Constraints:**
- Unique email addresses
- Valid enum values (roles, statuses)
- Required fields validation

### 5. Input Validation

**Using express-validator:**

```javascript
// Email validation
body('email').isEmail()

// Price validation
body('price').isFloat({ min: 0 })

// Date validation
body('checkIn').isISO8601()

// Enum validation
body('status').isIn(['AVAILABLE', 'UNAVAILABLE'])
```

**Validation Error Response:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

## 📊 Database Schema

### Indexes for Performance

**User Table:**
- Primary key: id (UUID)
- Unique index: email

**Room Table:**
- Primary key: id (UUID)
- Index: ownerId
- Index: price (for range queries)
- Index: capacity (for filtering)
- Index: status (for availability)

**Booking Table:**
- Primary key: id (UUID)
- Index: guestId
- Index: roomId
- Index: status
- Composite index: (checkIn, checkOut) for overlap checks

## 🔒 Security Features

### 1. Password Security
- Bcrypt hashing with salt rounds
- Passwords never stored in plain text
- Passwords never returned in responses

### 2. JWT Security
- Signed with secret key
- 7-day expiration
- Includes user ID and role
- Bearer token authentication

### 3. Input Sanitization
- Express-validator for all inputs
- Type checking
- Range validation
- Format validation

### 4. Error Handling
- Generic error messages for security
- Detailed logs for debugging
- No stack traces in production
- Proper HTTP status codes

## 📝 API Response Formats

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": [ ... ]  // Optional
}
```

### List Response
```json
{
  "count": 10,
  "items": [ ... ]
}
```

## 🧪 Testing Scenarios

### 1. Overlap Prevention Test
```
1. Create Room A
2. Guest 1 books Room A (Jan 1-5)
3. Guest 2 tries to book Room A (Jan 3-7)
4. Expected: 409 Conflict Error
```

### 2. Permission Test
```
1. Login as Guest
2. Try to create room
3. Expected: 403 Forbidden
```

### 3. Date Availability Test
```
1. Create 3 rooms
2. Book Room 1 (Jan 1-5)
3. Query available rooms (Jan 2-4)
4. Expected: Rooms 2 and 3 only
```

### 4. Owner Restriction Test
```
1. Owner A creates Room X
2. Owner B tries to update Room X
3. Expected: 403 Forbidden
```

## 📈 Performance Considerations

### Database Queries
- Indexed columns for fast lookups
- Selective field projection
- Eager loading for relations
- Query optimization for date ranges

### API Design
- Pagination ready (can be added)
- Filter support to reduce data transfer
- Efficient join queries
- Minimal N+1 query problems

## 🚀 Future Enhancements

Potential features for future versions:
- Email notifications for bookings
- Payment integration
- Reviews and ratings
- Image uploads for rooms
- Booking modifications
- Discount codes
- Multi-language support
- Real-time availability updates
- Booking history analytics
- Revenue reports for owners

---

**Version:** 1.0.0  
**Last Updated:** December 2025
