# Quick Reference Card - Room Booking API (NestJS)

## 🚀 Quick Start Commands

```bash
# Install & Setup
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate

# Run Server
npm run start:dev        # Development (watch mode)
npm run start:prod       # Production
npm run start:debug      # Debug mode
npm run build            # Build TypeScript

# NestJS CLI
nest generate module <name>      # Generate module
nest generate controller <name>  # Generate controller
nest generate service <name>     # Generate service

# Database Tools
npx prisma studio        # Visual database editor
npx prisma migrate reset # Reset database (⚠️ deletes data)
```

## 🔗 Important URLs

```
Server:          http://localhost:3000
API Docs:        http://localhost:3000/api
Health Check:    http://localhost:3000
Prisma Studio:   http://localhost:5555
```

## 🔑 Authentication Headers

```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## 📝 Quick API Reference

### Register & Login
```bash
# Register
POST /api/auth/register
{"email":"user@test.com","password":"pass123","name":"John","role":"OWNER"}

# Login (returns token)
POST /api/auth/login
{"email":"user@test.com","password":"pass123"}
```

### Rooms (Owner)
```bash
# Create Room
POST /api/rooms + Auth
{"name":"Suite","price":200,"capacity":2,"description":"Nice room"}

# Get all rooms
GET /api/rooms

# Update Room
PATCH /api/rooms/{id} + Auth
{"price":250,"status":"UNAVAILABLE"}

# Delete Room
DELETE /api/rooms/{id} + Auth
```

### Browse Rooms (Anyone)
```bash
# All Rooms
GET /api/rooms

# Filter by Price
GET /api/rooms?minPrice=100&maxPrice=300

# Filter by Capacity
GET /api/rooms?minCapacity=2&maxCapacity=4

# Available on Dates
GET /api/rooms?checkIn=2025-01-01&checkOut=2025-01-05

# Combined Filters
GET /api/rooms?minPrice=100&maxPrice=200&capacity=2&status=AVAILABLE
```

### Bookings (Guest)
```bash
# Create Booking
POST /api/bookings + Auth
{"roomId":"uuid","checkIn":"2025-01-01T14:00:00Z","checkOut":"2025-01-05T11:00:00Z"}

# My Bookings
GET /api/bookings/my-bookings + Auth

# Cancel Booking
PATCH /api/bookings/{id}/cancel + Auth
```

### Admin Dashboard
```bash
# Statistics
GET /api/admin/stats + Auth(Admin)

# All Users/Rooms/Bookings
GET /api/admin/users + Auth(Admin)
GET /api/admin/rooms + Auth(Admin)
GET /api/admin/bookings + Auth(Admin)

# Update Booking Status
PATCH /api/admin/bookings/{id}/status + Auth(Admin)
{"status":"CONFIRMED"}
```

## 🎭 User Roles & Permissions

| Feature | Guest | Owner | Admin |
|---------|-------|-------|-------|
| Browse Rooms | ✅ | ✅ | ✅ |
| Create Booking | ✅ | ❌ | ❌ |
| Cancel Own Booking | ✅ | ❌ | ❌ |
| Create Room | ❌ | ✅ | ❌ |
| Update Own Room | ❌ | ✅ | ❌ |
| View Room Bookings | ❌ | ✅ (own) | ✅ (all) |
| Dashboard Stats | ❌ | ❌ | ✅ |
| Manage All Data | ❌ | ❌ | ✅ |

## 📊 Status Enums

### Room Status
- `AVAILABLE` - Can be booked
- `UNAVAILABLE` - Cannot be booked

### Booking Status
- `PENDING` - Waiting confirmation
- `CONFIRMED` - Confirmed booking
- `CANCELLED` - Cancelled booking

### User Roles
- `GUEST` - Can browse and book
- `OWNER` - Can create rooms
- `ADMIN` - Full access

## ❌ Common HTTP Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request completed |
| 201 | Created | Resource created |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Overlapping booking |
| 500 | Server Error | Backend error |

## 🧪 Test Scenarios

### Scenario 1: Complete Booking Flow
```bash
# 1. Register as owner
POST /api/auth/register {"role":"OWNER",...}

# 2. Login & save token
POST /api/auth/login

# 3. Create room
POST /api/rooms + token

# 4. Register as guest
POST /api/auth/register {"role":"GUEST",...}

# 5. Login as guest
POST /api/auth/login

# 6. Browse available rooms
GET /api/rooms?checkIn=2025-01-01&checkOut=2025-01-05

# 7. Book a room
POST /api/bookings + token

# 8. View booking
GET /api/bookings/my-bookings + token
```

### Scenario 2: Test Overlap Prevention
```bash
# 1. Guest1 books Room1 (Jan 1-5)
POST /api/bookings {"roomId":"room1","checkIn":"2025-01-01",...}

# 2. Guest2 tries to book Room1 (Jan 3-7)
POST /api/bookings {"roomId":"room1","checkIn":"2025-01-03",...}
# Expected: 409 Conflict
```

### Scenario 3: Permission Test
```bash
# 1. Login as Guest
POST /api/auth/login

# 2. Try to create room
POST /api/rooms
# Expected: 403 Forbidden
```

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/room_booking
JWT_SECRET=your-secret-key-minimum-32-characters
PORT=3000
NODE_ENV=development
```

## 🐛 Debugging Tips

### Check Server Logs
- Look for detailed error messages in console
- Note the HTTP status code

### Use Prisma Studio
```bash
npx prisma studio
```
- View database directly
- Check if data was created
- Verify relationships

### Common Issues

**"Token expired"**
```bash
# Login again to get new token
POST /api/auth/login
```

**"Room not found"**
- Check if room ID is correct (UUID format)
- Verify room exists in database

**"Access denied"**
- Check user role matches required permission
- Verify token is included in Authorization header

**"Overlap detected"**
- Check dates of existing bookings
- Use different dates or different room

## 📦 Database Models Quick Ref

### User
```typescript
{
  id: uuid
  email: string (unique)
  password: string (hashed)
  name: string
  role: OWNER|GUEST|ADMIN
  createdAt: datetime
  updatedAt: datetime
}
```

### Room
```typescript
{
  id: uuid
  name: string
  description: string?
  price: float
  capacity: int
  status: AVAILABLE|UNAVAILABLE
  ownerId: uuid
  createdAt: datetime
  updatedAt: datetime
}
```

### Booking
```typescript
{
  id: uuid
  checkIn: datetime
  checkOut: datetime
  status: PENDING|CONFIRMED|CANCELLED
  guestId: uuid
  roomId: uuid
  createdAt: datetime
  updatedAt: datetime
}
```

## 🔍 Useful Prisma Commands

```bash
# View all migrations
npx prisma migrate status

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Generate client
npx prisma generate

# Format schema
npx prisma format
```

## 📚 Documentation Files

1. `README.md` - Overview
2. `SETUP.md` - Installation
3. `API_TESTING_GUIDE.md` - Testing guide
4. `FEATURES.md` - Feature details
5. `GIT_GUIDE.md` - Git workflow
6. `PROJECT_SUMMARY.md` - Complete summary
7. `/api-docs` - Swagger UI

## 💡 Pro Tips

1. **Always check token** - Most errors are missing/invalid tokens
2. **Use Prisma Studio** - Visual way to inspect data
3. **Check Swagger docs** - Interactive testing environment
4. **Read error messages** - They're designed to be helpful
5. **Test with Postman** - Collection has all scenarios ready
6. **Keep .env secure** - Never commit to git
7. **Use correct role** - Login with appropriate user role
8. **Check date format** - Use ISO 8601 (2025-01-01T14:00:00Z)

## 🎯 One-Line Solutions

```bash
# Full reset and restart
npx prisma migrate reset && npx prisma generate && npm run dev

# Quick database check
npx prisma studio

# View all routes
cat src/routes/*.js | grep "router\."

# Test health
curl http://localhost:3000/health

# Register admin user
curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"admin123","name":"Admin","role":"ADMIN"}'
```

## 📞 Need Help?

1. Check error message in response
2. Review server console logs
3. Inspect database with Prisma Studio
4. Read relevant documentation file
5. Check Swagger docs for endpoint details
6. Review Postman collection examples

---

**Quick Ref Version**: 1.0.0  
**Last Updated**: December 2025  
**Keep this handy!** 📌
