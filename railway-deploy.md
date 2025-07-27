# Deploy to Railway (Free Alternative)

## Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your repo
4. Add PostgreSQL service
5. Set environment variables
6. Deploy!

## Commands:
```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

## Environment Variables in Railway:
- DATABASE_URL (auto-generated with PostgreSQL)
- NEXTAUTH_URL = https://your-app.railway.app
- NEXTAUTH_SECRET = your-secret-key