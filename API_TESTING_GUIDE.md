# API Testing Guide

## Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Set up your database:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Start the server:
```bash
npm run dev
```

## Testing with Postman

### 1. Import the Collection

1. Open Postman
2. Click "Import" button
3. Select `postman_collection.json` file
4. The collection will be imported with all endpoints

### 2. Set Up Environment Variables

The collection uses two variables:
- `baseUrl`: Default is `http://localhost:3000`
- `token`: Automatically set after login

### 3. Testing Flow

#### Step 1: Register Users

1. **Register an Owner**
   - Use "Authentication > Register Owner"
   - Body:
   ```json
   {
     "email": "owner@example.com",
     "password": "password123",
     "name": "John Owner",
     "role": "OWNER"
   }
   ```

2. **Register a Guest**
   - Use "Authentication > Register Guest"
   - Body:
   ```json
   {
     "email": "guest@example.com",
     "password": "password123",
     "name": "Jane Guest",
     "role": "GUEST"
   }
   ```

3. **Register an Admin**
   - Use "Authentication > Register Admin"
   - Body:
   ```json
   {
     "email": "admin@example.com",
     "password": "password123",
     "name": "Admin User",
     "role": "ADMIN"
   }
   ```

#### Step 2: Login

1. Use "Authentication > Login"
2. The token will be automatically saved to the collection variable
3. All subsequent requests will use this token

#### Step 3: Test Owner Features

1. **Create a Room** (Rooms > Create Room)
   ```json
   {
     "name": "Deluxe Room",
     "description": "Spacious room with ocean view",
     "price": 150.00,
     "capacity": 2,
     "status": "AVAILABLE"
   }
   ```

2. **View My Rooms** (Rooms > Get My Rooms)

3. **Update Room** (Rooms > Update Room)
   - Copy room ID from create response
   - Update the `:roomId` parameter

4. **View Room Bookings** (Bookings > Get Room Bookings)

#### Step 4: Test Guest Features

1. **Login as Guest** (update credentials in login request)

2. **Browse Rooms** (Rooms > Get All Rooms)
   - Test filters:
     - By price: `?minPrice=100&maxPrice=200`
     - By capacity: `?minCapacity=2&maxCapacity=4`
     - By availability: `?checkIn=2025-01-01&checkOut=2025-01-05`

3. **Create Booking** (Bookings > Create Booking)
   ```json
   {
     "roomId": "paste-room-id-here",
     "checkIn": "2025-01-01T14:00:00Z",
     "checkOut": "2025-01-05T11:00:00Z"
   }
   ```

4. **View My Bookings** (Bookings > Get My Bookings)

5. **Cancel Booking** (Bookings > Cancel Booking)

#### Step 5: Test Admin Features

1. **Login as Admin**

2. **View Dashboard Stats** (Admin > Get Dashboard Stats)

3. **View All Users** (Admin > Get All Users)

4. **View All Rooms** (Admin > Get All Rooms)

5. **View All Bookings** (Admin > Get All Bookings)

6. **Update Booking Status** (Admin > Update Booking Status)
   ```json
   {
     "status": "CONFIRMED"
   }
   ```

## Testing Scenarios

### Scenario 1: Overlap Prevention

1. Login as Guest 1
2. Create a booking for Room A (Jan 1-5)
3. Login as Guest 2
4. Try to create a booking for Room A (Jan 3-7)
5. **Expected**: Error - "Room is already booked for the selected dates"

### Scenario 2: Room Filtering

1. Create multiple rooms with different prices and capacities
2. Test filters:
   ```
   GET /api/rooms?minPrice=100&maxPrice=200
   GET /api/rooms?capacity=2
   GET /api/rooms?checkIn=2025-01-01&checkOut=2025-01-05
   ```

### Scenario 3: Permission Testing

1. Login as Guest
2. Try to create a room (POST /api/rooms)
3. **Expected**: Error - "Access denied. Insufficient permissions."

4. Login as Owner
5. Try to cancel another user's booking
6. **Expected**: Error - "You can only cancel your own bookings"

### Scenario 4: Validation Testing

1. Try to register with invalid email
2. **Expected**: Validation error

3. Try to create room with negative price
4. **Expected**: Validation error

5. Try to create booking with checkOut before checkIn
6. **Expected**: Error - "Check-out date must be after check-in date"

## Using Swagger Documentation

Alternative to Postman, you can use the built-in Swagger UI:

1. Start the server
2. Open browser: `http://localhost:3000/api-docs`
3. Click "Authorize" button
4. Enter: `Bearer <your-token>`
5. Test endpoints directly from the browser

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., overlapping booking)
- `500` - Internal Server Error

## Tips

1. **Token Expiration**: Tokens expire after 7 days. Login again if you get 401 errors.

2. **Database Reset**: To reset the database:
   ```bash
   npx prisma migrate reset
   ```

3. **View Database**: Use Prisma Studio:
   ```bash
   npx prisma studio
   ```

4. **Debugging**: Check server logs for detailed error messages.
