# Quick Setup Instructions

## MongoDB Atlas Connection String Format

After clicking "Drivers" in MongoDB Atlas and copying your connection string:

1. **Original format from Atlas:**
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

2. **What to do:**
   - Replace `<username>` with your actual database username
   - Replace `<password>` with your actual password
   - Add `/campusstays` before the `?` to specify the database name

3. **Final format for your .env:**
   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/campusstays?retryWrites=true&w=majority
   ```

## URL Encoding Special Characters

If your password contains special characters, encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`

**Example:** If your password is `P@ssw0rd#123`
- Encoded: `P%40ssw0rd%23123`

## Update .env File

1. Open `backend/.env`
2. Replace the `MONGODB_URI` line with your actual connection string
3. Update `JWT_SECRET` with a strong random string (at least 32 characters)

## Test Connection

After updating `.env`, test the connection:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas
✅ Seeded admin user
✅ Seeded guest user
✅ Seeded rooms
🚀 Server running on http://localhost:3001
```

## Troubleshooting

- **Authentication failed**: Check username/password are correct
- **IP not whitelisted**: Add your IP in MongoDB Atlas Network Access
- **Connection timeout**: Check internet connection and cluster status
