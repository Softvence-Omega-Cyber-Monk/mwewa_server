# ✅ Render Deployment Configuration Checklist

Your project is now fully configured for deployment on Render! Here's what has been set up:

## Files Created/Modified

### 📄 Configuration Files
- ✅ **[render.yaml](./render.yaml)** - Render infrastructure-as-code configuration
  - Configures web service with build and start commands
  - Sets up PostgreSQL database instance
  - Defines environment variables

- ✅ **[.env.example](./.env.example)** - Example environment variables
  - Template for required environment variables
  - Safe to commit to version control

- ✅ **[.env](./.env)** - Local development environment
  - ⚠️ **DO NOT COMMIT** (already in .gitignore)
  - Use for local development only

### 📚 Documentation
- ✅ **[RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)** - Complete deployment guide
  - Step-by-step deployment instructions
  - Troubleshooting guide
  - Environment variable reference

- ✅ **[README.md](./README.md)** - Updated project README
  - CivicVoice project description
  - Links to deployment and API docs

### 📦 Build Configuration
- ✅ **[package.json](./package.json)** - Updated scripts
  - `build` now includes Prisma code generation
  - Added `prisma:migrate:deploy` for production migrations

## Environment Variables Required

When deploying to Render, set these in the Render dashboard under "Environment":

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | PostgreSQL connection from Render DB | ✅ Auto |
| `JWT_SECRET` | Generate: `openssl rand -base64 32` | ✅ Yes |
| `ALLOWED_ORIGINS` | Your frontend URL(s) | ⚠️ For CORS |
| `NODE_ENV` | `production` | ✅ Yes |
| `PORT` | `3000` | ✅ Auto |

## Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

### Step 2: Connect to Render
1. Go to [render.com](https://render.com/)
2. Click "Dashboard" → "New" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect `render.yaml`

### Step 3: Configure Environment
In Render dashboard:
- Generate `JWT_SECRET`: `openssl rand -base64 32`
- Set `ALLOWED_ORIGINS` to your frontend URL
- Leave `DATABASE_URL` (auto-linked from database instance)
- Keep `NODE_ENV` as `production`

### Step 4: Deploy
- Render will automatically deploy on push to main branch
- Monitor build logs in "Deploy" section
- Check service is running in "Overview"

## Post-Deployment

✅ **Access your API:**
- Base URL: `https://your-service-name.onrender.com`
- API docs: `https://your-service-name.onrender.com/api/docs`

✅ **Database Management:**
- Use Render dashboard PostgreSQL interface
- Or run Prisma Studio locally:
  ```bash
  pnpm run prisma:studio
  ```

✅ **Monitor:**
- Check logs in Render dashboard
- Set up Sentry for error tracking
- Configure Slack alerts (Render integrations)

## Common Issues & Solutions

### ❌ Build fails: "pnpm not found"
**Solution:** Render uses npm by default. Add to `render.yaml`:
```yaml
buildCommand: npm install -g pnpm && pnpm install && pnpm run build
```

### ❌ Database connection errors
**Solution:** 
- Verify `DATABASE_URL` in Render dashboard
- Check PostgreSQL instance is running (not paused)
- Review build logs for migration errors

### ❌ JWT_SECRET not set
**Solution:**
- Generate: `openssl rand -base64 32`
- Add to Render environment variables (NOT in code!)

### ❌ CORS errors from frontend
**Solution:**
- Set `ALLOWED_ORIGINS` to your frontend domain
- Format: `https://example.com,https://www.example.com`

## Useful Commands

```bash
# Test build locally
pnpm run build
pnpm run start:prod

# Export environment from .env for testing
export $(cat .env | xargs)
pnpm run start:prod

# Generate new JWT secret
openssl rand -base64 32

# Check Prisma migrations status
pnpm run prisma:migrate:deploy --dry-run
```

## Next: Update GitHub Repo

Before deploying, make sure to:

1. **Add deployment badge to README:**
   ```markdown
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR-USERNAME/repos/mwewa-server)
   ```

2. **Protect main branch:**
   - Settings → Branches → Add protection rule
   - Require status checks before merging

3. **Add secrets (optional):**
   - Use GitHub Actions for CI/CD
   - Render will auto-deploy on push

4. **Document API in GitHub:**
   - Update issues/wiki with API endpoint
   - Link to Swagger docs

---

**Questions?** Check [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) or visit [Render Docs](https://render.com/docs)

**Ready to deploy?** Push to GitHub and Render will handle the rest! 🚀
