# MongoDB Atlas Setup Guide

This guide will walk you through setting up MongoDB Atlas for the CampusStays backend.

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Sign Up"**
3. Fill in your details and create an account

## Step 2: Create a Cluster

1. After signing in, you'll be prompted to create a cluster
2. Select **"Build a Database"**
3. Choose the **FREE (M0)** tier
4. Select a cloud provider and region (choose one closest to you)
5. Give your cluster a name (e.g., "campusstays-cluster")
6. Click **"Create Cluster"**
7. Wait 3-5 minutes for the cluster to be created

## Step 3: Create a Database User

1. Once the cluster is ready, you'll see a security setup modal
2. Create a database user:
   - **Username**: Choose a username (e.g., "campusstays-admin")
   - **Password**: Click "Autogenerate Secure Password" or create your own
   - **⚠️ IMPORTANT**: Save the password - you'll need it for the connection string!
3. Click **"Create Database User"**

## Step 4: Configure Network Access

1. In the security modal, configure network access
2. For development, click **"Add My Current IP Address"**
3. For production, you can add specific IPs or use `0.0.0.0/0` (less secure, allows all IPs)
4. Click **"Finish and Close"**

## Step 5: Get Your Connection String

1. On the cluster dashboard, click **"Connect"** button
2. Select **"Drivers"** option
3. Choose:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
4. Copy the connection string - it will look like:
   ```
   mongodb+srv://<username>:<password>@campusstays-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your Environment Variables

1. Open your `backend/.env` file (create it if it doesn't exist)
2. Replace `<username>` and `<password>` in the connection string with your actual credentials
3. Add a database name at the end (before the `?`):
   ```
   mongodb+srv://<username>:<password>@campusstays-cluster.xxxxx.mongodb.net/campusstays?retryWrites=true&w=majority
   ```
4. Add to your `backend/.env` file:
   ```env
   PORT=3001
   JWT_SECRET=your-secret-key-change-in-production-make-it-long-and-random
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://<username>:<password>@campusstays-cluster.xxxxx.mongodb.net/campusstays?retryWrites=true&w=majority
   ```

## Step 7: Test the Connection

1. Install backend dependencies (if not already done):
   ```bash
   cd backend
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   ✅ Connected to MongoDB Atlas
   ✅ Seeded admin user
   ✅ Seeded guest user
   ✅ Seeded rooms
   🚀 Server running on http://localhost:3001
   ```

## Troubleshooting

### Connection Error: "authentication failed"
- Double-check your username and password in the connection string
- Make sure special characters in password are URL-encoded (e.g., `@` becomes `%40`)

### Connection Error: "IP not whitelisted"
- Go to Network Access in MongoDB Atlas
- Add your current IP address
- Wait a few minutes for changes to propagate

### Connection Timeout
- Check your internet connection
- Verify the cluster is running (status should be green)
- Try connecting from a different network

### Database Name Issues
- The database name in the connection string is `campusstays`
- MongoDB Atlas will create this database automatically on first connection
- Collections (users, rooms, bookings, reviews) will be created automatically

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong passwords** - For both database user and JWT_SECRET
3. **Restrict IP access** - Only allow necessary IPs in production
4. **Regular backups** - MongoDB Atlas provides free automated backups on paid tiers
5. **Monitor access** - Check Atlas logs regularly for suspicious activity

## Next Steps

Once connected, the application will automatically:
- Create the database
- Seed initial admin and guest users
- Seed sample rooms

You can now use the API endpoints with full MongoDB persistence!
