@echo off
echo === Deploying MeraHisaab.ai to Vercel ===
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel

echo.
echo Step 2: Building the project...
npm run build

echo.
echo Step 3: Deploying to Vercel...
echo You'll need to:
echo 1. Log in to Vercel
echo 2. Set up environment variables
echo 3. Deploy
echo.
vercel --prod

echo.
echo Deployment complete!
pause