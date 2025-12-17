# Setup Instructions

## Quick Start

Follow these steps to get the Room Booking Management System up and running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Using PostgreSQL (Recommended)

1. Install PostgreSQL if not already installed
2. Create a new database:
   ```sql
   CREATE DATABASE room_booking;
   ```

3. Update `.env` file with your database credentials:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/room_booking?schema=public"
   ```

#### Option B: Using SQLite (For Development)

1. Change the datasource in `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

### 3. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This will:
- Create the database tables
- Generate Prisma Client

### 4. (Optional) Seed Initial Data

You can use Prisma Studio to add initial data:

```bash
npx prisma studio
```

Or create test users via the API after starting the server.

### 5. Start the Server

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

### 6. Verify Installation

1. Open browser: `http://localhost:3000`
   - You should see: `{"message":"Room Booking Management API","version":"1.0.0",...}`

2. Check API Documentation: `http://localhost:3000/api-docs`

3. Health Check: `http://localhost:3000/health`

## Testing the API

### Option 1: Using Swagger UI

1. Navigate to `http://localhost:3000/api-docs`
2. Click "Authorize" and enter your JWT token
3. Test endpoints directly

### Option 2: Using Postman

1. Import `postman_collection.json`
2. Follow the `API_TESTING_GUIDE.md`

### Option 3: Using cURL

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123",
    "name": "John Owner",
    "role": "OWNER"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@example.com",
    "password": "password123"
  }'
```

**Create a room (replace TOKEN with your JWT):**
```bash
curl -X POST http://localhost:3000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Deluxe Room",
    "description": "Beautiful ocean view",
    "price": 150.00,
    "capacity": 2
  }'
```

## Useful Commands

### Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format
```

### Development Commands

```bash
# Start in development mode
npm run dev

# Start in production mode
npm start

# Run specific migration
npm run prisma:migrate

# Generate Prisma Client
npm run prisma:generate

# Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/room_booking?schema=public"

# JWT secret key (change this!)
JWT_SECRET=your-secret-key-here-change-in-production

# Server port
PORT=3000

# Environment
NODE_ENV=development
```

## Troubleshooting

### Error: "Can't reach database server"

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists

### Error: "Prisma Client not initialized"

Run:
```bash
npx prisma generate
```

### Error: "Port 3000 already in use"

Change PORT in `.env` file or stop the process using port 3000:

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

Linux/Mac:
```bash
lsof -ti:3000 | xargs kill -9
```

### Migration Issues

Reset and start fresh:
```bash
npx prisma migrate reset
npx prisma migrate dev --name init
```

## Project Structure

```
shahd/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── swagger.js         # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── roomController.js  # Room management
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── validation.js      # Input validation
│   │   └── errorHandler.js    # Error handling
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roomRoutes.js
│   │   ├── bookingRoutes.js
│   │   └── adminRoutes.js
│   └── server.js              # Main application file
├── .env                       # Environment variables
├── .env.example              # Environment template
├── .gitignore
├── package.json
├── postman_collection.json   # Postman API collection
├── API_TESTING_GUIDE.md      # Testing documentation
├── SETUP.md                  # This file
└── README.md                 # Project overview
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Set up database
3. ✅ Run migrations
4. ✅ Start server
5. 📝 Register test users
6. 🧪 Test API endpoints
7. 🚀 Deploy to production (optional)

## Production Deployment

### Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for specific origins
- [ ] Set up rate limiting
- [ ] Enable database connection pooling
- [ ] Set up logging and monitoring
- [ ] Regular database backups

### Deployment Options

- **Heroku**: Easy deployment with PostgreSQL addon
- **Railway**: Simple deployment with built-in PostgreSQL
- **DigitalOcean**: App Platform or Droplets
- **AWS**: EC2 + RDS
- **Vercel/Netlify**: Not recommended for this type of backend

## Support

For issues or questions:
1. Check this guide and README.md
2. Review API_TESTING_GUIDE.md
3. Check server logs for errors
4. Inspect database with Prisma Studio

Happy coding! 🎉
