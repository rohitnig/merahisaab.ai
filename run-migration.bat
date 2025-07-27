@echo off
set DATABASE_URL=postgresql://postgres:default@localhost:5432/merahisaab?schema=public
set NEXTAUTH_URL=http://localhost:3000
set NEXTAUTH_SECRET=your-secret-key-here

echo Creating database if it doesn't exist...
"C:\Program Files\PostgreSQL\17\bin\psql" -U postgres -h localhost -c "CREATE DATABASE merahisaab;" 2>nul

echo Running Prisma migration...
npx prisma migrate dev --name init

echo Generating Prisma client...
npx prisma generate

echo Migration completed!
pause