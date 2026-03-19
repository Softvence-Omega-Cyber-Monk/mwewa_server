# 🚀 Render Deployment Guide

This project is configured for deployment on [Render](https://render.com/).

## Prerequisites

- Render account (free tier available)
- Git repository pushed to GitHub
- pnpm package manager

## One-Click Deployment

1. Click the button below to start deployment on Render:

   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=YOUR_GITHUB_REPO_URL)

2. Or manually deploy by connecting your GitHub repo to Render using the `render.yaml` configuration.

## Manual Deployment Steps

### 1. Create a Render Account
- Visit [render.com](https://render.com/)
- Sign up with GitHub

### 2. Create a PostgreSQL Database
- Go to Dashboard → New PostgreSQL
- Name: `civicvoice-db`
- Region: Oregon (or your preferred region)
- Plan: Free (sufficient for development)
- Keep the credentials safe

### 3. Deploy the Web Service
- Go to Dashboard → New Web Service
- Connect your GitHub repository
- Configure:
  - **Name**: `civicvoice-api`
  - **Environment**: Node
  - **Region**: Oregon (same as database)
  - **Plan**: Free
  - **Build Command**: `pnpm install && pnpm run build && npx prisma migrate deploy`
  - **Start Command**: `node dist/main`

### 4. Set Environment Variables
In the Render dashboard, add these environment variables to your web service:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `DATABASE_URL` | From database instance | Auto-linked if using render.yaml |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | **Change this immediately!** |
| `ALLOWED_ORIGINS` | `https://yourfrontend.com,https://yourapp.com` | Comma-separated list |

### 5. Database Migration
Prisma migrations run automatically during build via `npx prisma migrate deploy` in the build command.

## Environment Variables

Create a `.env` file locally based on `.env.example`:

```bash
cp .env.example .env
```

Update the values:
- `DATABASE_URL` - Your Render PostgreSQL connection string
- `JWT_SECRET` - Generate a strong secret
- `ALLOWED_ORIGINS` - Your frontend URL(s)

## Development vs Production

### Development
```bash
pnpm install
pnpm run start:dev
```

### Production (Local)
```bash
pnpm install
pnpm run build
pnpm run start:prod
```

## Troubleshooting

### Build Fails: "pnpm: command not found"
Render uses npm/yarn by default. To use pnpm:
1. Add `packageManager: pnpm@latest` to package.json
2. Or specify Node version in render.yaml:
```yaml
services:
  - type: web
    buildCommand: npm install -g pnpm && pnpm install && pnpm run build
```

### Database Connection Issues
- Verify `DATABASE_URL` is set in Render dashboard
- Check PostgreSQL is running (not paused)
- Ensure Prisma migrations ran successfully during build

### Migrations Fail
Check build logs in Render dashboard. Common issues:
- Schema conflicts with existing database
- Missing environment variables
- Stale Prisma Client (`pnpm run prisma:generate`)

## Next Steps

1. **Setup Monitoring**: Use Render's built-in monitoring and Sentry for error tracking
2. **Custom Domain**: Connect a custom domain in Render dashboard
3. **Scheduled Tasks**: The scheduler service runs background Cron jobs (polls auto-close)
4. **Logging**: Check logs in Render dashboard → Service → Logs
5. **Scaling**: Upgrade to paid plan when ready for production traffic

## Useful Commands

```bash
# Check database state
pnpm run prisma:studio

# Run migrations locally
pnpm run prisma:migrate

# Generate Prisma Client
pnpm run prisma:generate

# View API docs
# Go to https://your-deployed-app.onrender.com/api/docs
```

## Support

- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://prisma.io/docs
- **NestJS Docs**: https://docs.nestjs.com
