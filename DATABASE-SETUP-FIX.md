# Database Setup Fix

## Problem
The dashboard was not fetching data because the `DATABASE_URL` environment variable was empty.

## Solution Applied
Updated `.env.local` with a PostgreSQL connection string:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/blood_bank_db?schema=public"
```

## Next Steps - Database Setup

### Option 1: If you have PostgreSQL installed locally

1. **Check if PostgreSQL is running:**
   ```powershell
   Get-Service -Name postgresql*
   ```

2. **Create the database:**
   ```powershell
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create the database
   CREATE DATABASE blood_bank_db;
   
   # Exit
   \q
   ```

3. **Run Prisma migrations:**
   ```powershell
   npx prisma migrate dev
   ```

4. **Seed the database with sample data:**
   ```powershell
   npm run prisma:seed
   ```

### Option 2: If PostgreSQL is NOT installed

**Install PostgreSQL:**
1. Download from: https://www.postgresql.org/download/windows/
2. During installation, set password to `password` (or update `.env.local` with your password)
3. Keep default port `5432`
4. After installation, follow Option 1 steps above

### Option 3: Use Docker (Recommended for development)

```powershell
# Start PostgreSQL in Docker
docker run --name postgres-bloodbank -e POSTGRES_PASSWORD=password -e POSTGRES_DB=blood_bank_db -p 5432:5432 -d postgres:15

# Run migrations
npx prisma migrate dev

# Seed database
npm run prisma:seed
```

### Option 4: Use a cloud database (Easiest)

Use a free PostgreSQL database from:
- **Supabase**: https://supabase.com (Free tier)
- **Neon**: https://neon.tech (Free tier)
- **Railway**: https://railway.app (Free trial)

1. Create a free account
2. Create a PostgreSQL database
3. Copy the connection string
4. Update `.env.local` with your connection string:
   ```
   DATABASE_URL="your_connection_string_here"
   ```

### Verify Database Connection

After setting up the database, test the connection:

```powershell
npm run test:db
```

Or visit: http://localhost:3000/dashboard
- If you see data, the database is working!
- If you see errors, check the terminal for connection issues

## Current Status

✅ `.env.local` updated with DATABASE_URL
✅ Dev server restarted
⏳ Need to set up PostgreSQL database and run migrations

## Quick Test

Visit these URLs to check if APIs work:
- http://localhost:3000/dashboard - Should show dashboard data
- http://localhost:3000/api/blood-inventory - Should return JSON data
- http://localhost:3000/api/blood-requests - Should return JSON data

If you see database connection errors, you need to set up PostgreSQL first.
