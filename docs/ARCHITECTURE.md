# System Architecture & Flow Diagrams (NestJS)

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  (Postman / Swagger UI / Mobile App / Web Frontend)            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS Requests
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│                      (NestJS Server)                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CORS       │  │  Validation  │  │    Logger    │         │
│  │  (Global)    │  │   Pipe       │  │ (Interceptor)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    GUARDS LAYER                                  │
│                  (Authentication & Authorization)                │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  JwtAuthGuard    │  │   RolesGuard     │                   │
│  │  (JWT Verify)    │  │  (Role Check)    │                   │
│  └──────────────────┘  └──────────────────┘                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      MODULE LAYER                                │
│                  (Dependency Injection Container)                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   Auth   │  │  Rooms   │  │ Bookings │  │  Admin   │      │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘      │
│       │             │             │             │              │
│    ┌──▼──────────────▼─────────────▼─────────────▼────┐       │
│    │          Prisma Module (Global)                   │       │
│    └──────────────────────────────────────────────────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────────┐
│                   CONTROLLER LAYER                               │
│          (Route Handlers with Decorators)                        │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Auth     │  │    Rooms    │  │   Bookings  │            │
│  │ Controller  │  │ Controller  │  │ Controller  │            │
│  │ @ApiTags    │  │ @ApiTags    │  │ @ApiTags    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                   ┌─────────────┐                               │
│                   │    Admin    │                               │
│                   │ Controller  │                               │
│                   │ @ApiTags    │                               │
│                   └─────────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     SERVICE LAYER                                │
│                (Business Logic with DI)                          │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Auth     │  │    Rooms    │  │   Bookings  │            │
│  │  Service    │  │  Service    │  │   Service   │            │
│  │ @Injectable │  │ @Injectable │  │ @Injectable │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                   ┌─────────────┐                               │
│                   │    Admin    │                               │
│                   │  Service    │                               │
│                   │ @Injectable │                               │
│                   └─────────────┘                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│                     (Prisma Service)                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PrismaService                                │  │
│  │  - Extends PrismaClient                                   │  │
│  │  - OnModuleInit / OnModuleDestroy hooks                   │  │
│  │  - Type Safety & Relations                                │  │
│  │  - Injected into all modules via @Global()                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                      (PostgreSQL)                                │
│                                                                  │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐                │
│  │  Users  │      │  Rooms  │      │Bookings │                │
│  │  Table  │◄────►│  Table  │◄────►│  Table  │                │
│  └─────────┘      └─────────┘      └─────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Module Structure

```
AppModule (Root)
├── ConfigModule (Global)
├── PrismaModule (Global)
│   └── PrismaService
├── AuthModule
│   ├── AuthController
│   ├── AuthService
│   ├── JwtStrategy (Passport)
│   ├── JwtAuthGuard
│   ├── RolesGuard
│   └── Decorators (@Roles, @CurrentUser)
├── RoomsModule
│   ├── RoomsController
│   └── RoomsService
├── BookingsModule
│   ├── BookingsController
│   └── BookingsService
└── AdminModule
    ├── AdminController
    └── AdminService
```

## 🔄 Authentication Flow

```
┌──────────┐                                              ┌──────────┐
│  Client  │                                              │  Server  │
└────┬─────┘                                              └────┬─────┘
     │                                                          │
     │  POST /api/auth/register                                │
     │  {email, password, name, role}                          │
     ├─────────────────────────────────────────────────────────►
     │                                                          │
     │                              ValidationPipe validates DTO│
     │                              Hash password (bcrypt)      │
     │                              Create user in DB           │
     │                              Generate JWT token          │
     │                                                          │
     │  Response: {user, token}                                │
     ◄─────────────────────────────────────────────────────────┤
     │                                                          │
     │  Store token in client                                  │
     │                                                          │
     │  POST /api/auth/login                                   │
     │  {email, password}                                      │
     ├─────────────────────────────────────────────────────────►
     │                                                          │
     │                              Find user by email          │
     │                              Verify password             │
     │                              Generate JWT token          │
     │                                                          │
     │  Response: {user, token}                                │
     ◄─────────────────────────────────────────────────────────┤
     │                                                          │
     │  Subsequent requests with token                         │
     │  Authorization: Bearer <token>                          │
     ├─────────────────────────────────────────────────────────►
     │                                                          │
     │                              Verify token                │
     │                              Extract user info           │
     │                              Check permissions           │
     │                              Process request             │
     │                                                          │
     │  Response: {data}                                       │
     ◄─────────────────────────────────────────────────────────┤
     │                                                          │
```

## 📅 Booking Creation Flow

```
┌───────┐                                                    ┌────────┐
│ Guest │                                                    │ System │
└───┬───┘                                                    └───┬────┘
    │                                                            │
    │  1. Browse available rooms                                │
    │  GET /api/rooms?checkIn=...&checkOut=...                  │
    ├───────────────────────────────────────────────────────────►
    │                                                            │
    │                        Query rooms                         │
    │                        Check existing bookings             │
    │                        Filter out unavailable              │
    │                                                            │
    │  Response: Available rooms                                │
    ◄───────────────────────────────────────────────────────────┤
    │                                                            │
    │  2. Select room and create booking                        │
    │  POST /api/bookings                                       │
    │  {roomId, checkIn, checkOut}                              │
    ├───────────────────────────────────────────────────────────►
    │                                                            │
    │                        ┌──────────────────────┐            │
    │                        │ Validation Checks:   │            │
    │                        │ ✓ Dates valid?       │            │
    │                        │ ✓ Room exists?       │            │
    │                        │ ✓ Room available?    │            │
    │                        │ ✓ No overlap?        │            │
    │                        └──────────────────────┘            │
    │                                                            │
    │                        If all pass:                        │
    │                        Create booking (PENDING)            │
    │                        Store in database                   │
    │                                                            │
    │  Response: Booking created                                │
    ◄───────────────────────────────────────────────────────────┤
    │                                                            │
```

## 🔍 Overlap Prevention Algorithm

```
Given: New booking request (checkIn, checkOut)

FOR EACH existing booking in room:
  IF existing.status IN (PENDING, CONFIRMED):
    
    Check Scenario 1: New starts during existing
    ┌─────────────┐
    │  Existing   │
    └─────────────┘
        ┌─────────────┐
        │    New      │
        └─────────────┘
    IF (existing.checkIn <= new.checkIn AND 
        existing.checkOut > new.checkIn)
      RETURN OVERLAP

    Check Scenario 2: New ends during existing
          ┌─────────────┐
          │  Existing   │
          └─────────────┘
    ┌─────────────┐
    │    New      │
    └─────────────┘
    IF (existing.checkIn < new.checkOut AND 
        existing.checkOut >= new.checkOut)
      RETURN OVERLAP

    Check Scenario 3: New completely contains existing
       ┌──────┐
       │Exist.│
       └──────┘
    ┌──────────────┐
    │     New      │
    └──────────────┘
    IF (existing.checkIn >= new.checkIn AND 
        existing.checkOut <= new.checkOut)
      RETURN OVERLAP

IF no overlaps found:
  ALLOW BOOKING
ELSE:
  RETURN 409 CONFLICT
```

## 👥 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ROLES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐        ┌────────────────┐                  │
│  │     GUEST      │        │     OWNER      │                  │
│  ├────────────────┤        ├────────────────┤                  │
│  │ • Browse rooms │        │ • Create rooms │                  │
│  │ • View details │        │ • Update rooms │                  │
│  │ • Make booking │        │ • Delete rooms │                  │
│  │ • View own     │        │ • View all own │                  │
│  │   bookings     │        │   bookings     │                  │
│  │ • Cancel own   │        │ • View room    │                  │
│  │   bookings     │        │   statistics   │                  │
│  └────────────────┘        └────────────────┘                  │
│                                                                  │
│            ┌────────────────────────────┐                       │
│            │         ADMIN              │                       │
│            ├────────────────────────────┤                       │
│            │ • All Guest permissions    │                       │
│            │ • All Owner permissions    │                       │
│            │ • View all users           │                       │
│            │ • View all rooms           │                       │
│            │ • View all bookings        │                       │
│            │ • Update booking status    │                       │
│            │ • Delete users             │                       │
│            │ • Dashboard statistics     │                       │
│            └────────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Permission Check Flow:
┌──────────┐
│ Request  │
└────┬─────┘
     │
     ▼
┌──────────────┐      NO      ┌─────────┐
│ Has token?   ├─────────────►│ 401 Err │
└────┬─────────┘              └─────────┘
     │ YES
     ▼
┌──────────────┐      NO      ┌─────────┐
│ Valid token? ├─────────────►│ 401 Err │
└────┬─────────┘              └─────────┘
     │ YES
     ▼
┌──────────────┐      NO      ┌─────────┐
│ Has role?    ├─────────────►│ 403 Err │
└────┬─────────┘              └─────────┘
     │ YES
     ▼
┌──────────────┐      NO      ┌─────────┐
│ Owns resource├─────────────►│ 403 Err │
│ (if needed)? │              └─────────┘
└────┬─────────┘
     │ YES
     ▼
┌──────────────┐
│   ALLOWED    │
└──────────────┘
```

## 🗄️ Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE SCHEMA                            │
└─────────────────────────────────────────────────────────────────┘

    ┌─────────────────────┐
    │       USER          │
    ├─────────────────────┤
    │ id (PK)             │
    │ email (UNIQUE)      │
    │ password (hashed)   │
    │ name                │
    │ role (ENUM)         │
    │ createdAt           │
    │ updatedAt           │
    └──────┬──────────┬───┘
           │          │
           │          │ ownerId (FK)
           │          │
           │          ▼
           │    ┌─────────────────────┐
           │    │       ROOM          │
           │    ├─────────────────────┤
           │    │ id (PK)             │
           │    │ name                │
           │    │ description         │
           │    │ price               │
           │    │ capacity            │
           │    │ status (ENUM)       │
           │    │ ownerId (FK)        │◄─┐
           │    │ createdAt           │  │
           │    │ updatedAt           │  │
           │    └─────────┬───────────┘  │
           │              │               │
           │              │ roomId (FK)   │
           │              │               │
           │              ▼               │
           │    ┌─────────────────────┐  │
           │    │      BOOKING        │  │
           │    ├─────────────────────┤  │
           │    │ id (PK)             │  │
           │    │ checkIn             │  │
           │    │ checkOut            │  │
           │    │ status (ENUM)       │  │
           │    │ guestId (FK)        │──┘ (relation)
           │    │ roomId (FK)         │
           │    │ createdAt           │
           │    │ updatedAt           │
           │    └─────────────────────┘
           │              │
           │ guestId (FK) │
           │              │
           └──────────────┘

Cascade Rules:
• Delete User → Delete owned Rooms (if no active bookings)
• Delete User → Delete made Bookings
• Delete Room → Delete all Bookings for that room
```

## 📊 Request/Response Flow

```
┌────────┐     ┌────────┐     ┌──────────┐     ┌────────────┐     ┌──────────┐
│ Client │────►│ Route  │────►│Middleware│────►│ Controller │────►│ Database │
└────────┘     └────────┘     └──────────┘     └────────────┘     └──────────┘
    ▲              │               │                  │                  │
    │              │               │                  │                  │
    │              │               │                  │                  │
    │              ▼               ▼                  ▼                  ▼
    │          Validate       Authenticate      Business           Query/
    │          Input          & Authorize       Logic              Mutation
    │              │               │                  │                  │
    │              │               │                  │                  │
    └──────────────┴───────────────┴──────────────────┴──────────────────┘
                            Response Flow (back to client)

Example: Create Booking Request

1. Client → Route
   POST /api/bookings
   Headers: { Authorization: Bearer token }
   Body: { roomId, checkIn, checkOut }

2. Route → Middleware (Validation)
   ✓ checkIn is valid date?
   ✓ checkOut is valid date?
   ✓ roomId is provided?

3. Middleware → Middleware (Authentication)
   ✓ Token exists?
   ✓ Token valid?
   ✓ User exists?

4. Middleware → Middleware (Authorization)
   ✓ User has GUEST role?

5. Middleware → Controller
   ✓ All checks passed

6. Controller → Database
   • Validate dates
   • Check room exists
   • Check room available
   • Check for overlaps
   • Create booking

7. Database → Controller
   • Return created booking

8. Controller → Client
   201 Created
   { message, booking }
```

## 🔄 Data Flow Example: Room Filtering

```
Client Request:
GET /api/rooms?minPrice=100&maxPrice=200&capacity=2&checkIn=2025-01-01&checkOut=2025-01-05

                    ↓

┌─────────────────────────────────────────────────────────┐
│                  Query Builder                           │
├─────────────────────────────────────────────────────────┤
│ WHERE price >= 100                                       │
│   AND price <= 200                                       │
│   AND capacity >= 2                                      │
├─────────────────────────────────────────────────────────┤
│ INCLUDE bookings WHERE                                   │
│   checkIn < '2025-01-05'                                │
│   AND checkOut > '2025-01-01'                           │
│   AND status IN ('CONFIRMED', 'PENDING')                │
└─────────────────────────────────────────────────────────┘

                    ↓

┌─────────────────────────────────────────────────────────┐
│              Database Query Result                       │
├─────────────────────────────────────────────────────────┤
│ Room A (price: 150, capacity: 2)                        │
│   └─ Booking 1 (Jan 2-4, CONFIRMED) ← OVERLAP!         │
│                                                          │
│ Room B (price: 180, capacity: 2)                        │
│   └─ No overlapping bookings ✓                          │
│                                                          │
│ Room C (price: 120, capacity: 3)                        │
│   └─ Booking 2 (Jan 10-15, PENDING) ← No overlap ✓     │
└─────────────────────────────────────────────────────────┘

                    ↓

┌─────────────────────────────────────────────────────────┐
│            Application Filter Logic                      │
├─────────────────────────────────────────────────────────┤
│ FOR EACH room:                                           │
│   IF room.bookings.length > 0:                          │
│     EXCLUDE room                                         │
│   ELSE:                                                  │
│     INCLUDE room                                         │
└─────────────────────────────────────────────────────────┘

                    ↓

Client Response:
{
  "count": 2,
  "rooms": [
    { "id": "room-b-id", "name": "Room B", ... },
    { "id": "room-c-id", "name": "Room C", ... }
  ]
}
```

---

**Architecture Version**: 1.0.0  
**Last Updated**: December 2025
