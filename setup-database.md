# PostgreSQL Setup Guide for MeraHisaab.ai

## Option 1: Install PostgreSQL Locally

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download PostgreSQL installer (latest version)
3. Run the installer as Administrator

### Step 2: Installation Settings
- Port: 5432 (default)
- Username: postgres
- Set a password (remember this!)
- Database: postgres (default)

### Step 3: Update .env.local
Replace the DATABASE_URL in your .env.local file:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/merahisaab?schema=public"
```

### Step 4: Create Database
Open Command Prompt as Administrator and run:
```
psql -U postgres -h localhost
CREATE DATABASE merahisaab;
\q
```

## Option 2: Use Docker (If you have Docker Desktop)

### Step 1: Create docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
      POSTGRES_DB: merahisaab
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 2: Start Database
```
docker-compose up -d
```

### Step 3: Update .env.local
```
DATABASE_URL="postgresql://postgres:password123@localhost:5432/merahisaab?schema=public"
```

## Option 3: Cloud Database (Easiest - No Local Setup)

### Supabase (Free Tier)
1. Go to https://supabase.com
2. Create account and new project
3. Copy the DATABASE_URL from Settings > Database
4. Update your .env.local

### Neon (Free Tier)
1. Go to https://neon.tech
2. Create account and database
3. Copy connection string
4. Update your .env.local

## After Database Setup

Run these commands in your project directory:
```
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## Verify Setup
Your database should have these tables:
- store_owners
- customers  
- transactions