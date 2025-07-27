@echo off
echo === Pushing MeraHisaab.ai to GitHub ===
echo.

echo Step 1: Adding files to git...
git add .

echo Step 2: Making initial commit...
git commit -m "Initial commit: MeraHisaab.ai - Digital ledger for Kirana stores"

echo Step 3: Adding GitHub remote...
echo Enter your GitHub repository URL (e.g., https://github.com/username/merahisaab-ai.git):
set /p REPO_URL="Repository URL: "

git remote add origin %REPO_URL%

echo Step 4: Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo Code pushed to GitHub successfully!
echo Now you can deploy to Vercel!
pause