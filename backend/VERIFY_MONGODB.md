# How to Verify Data in MongoDB Atlas

## ✅ Data IS Being Stored!

Your backend is successfully storing all data in MongoDB Atlas. Here's how to verify:

## Method 1: Check via MongoDB Atlas Web UI

1. **Log into MongoDB Atlas**: https://cloud.mongodb.com
2. **Navigate to your cluster**: Click on "CampusConnect" cluster
3. **Click "Browse Collections"** button
4. **Select database**: `campusstays`
5. **View collections**:
   - `users` - Contains admin and guest users
   - `rooms` - Contains all room listings
   - `bookings` - Contains all bookings
   - `reviews` - Contains reviews (when created)

## Method 2: Check via API

```bash
# Get all rooms
curl http://localhost:3001/api/rooms

# Login and get your token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@campus.edu","password":"admin123"}'

# Get all bookings (requires auth token)
curl http://localhost:3001/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Method 3: Create and Verify Data

1. **Create a new room** (as admin)
2. **Restart your backend server**
3. **Check if the room still exists** - It should!

This proves data is persisted in MongoDB Atlas, not just in memory.

## Current Data

### Users Collection:
- `admin@campus.edu` (ADMIN role)
- `guest@visitor.com` (GUEST role)

### Rooms Collection:
- Room 101 (Single, $50)
- Room 102 (Single, $55)
- Room 201 (Double, $80)
- Room 202 (Suite, $120)

## Verify in Atlas UI

1. Go to https://cloud.mongodb.com
2. Select your project "CampusConnect"
3. Click "Browse Collections"
4. Select database: `campusstays`
5. Click on `users` collection - you'll see the seeded users
6. Click on `rooms` collection - you'll see the 4 seeded rooms

**All data persists in MongoDB Atlas, not in local memory!**
