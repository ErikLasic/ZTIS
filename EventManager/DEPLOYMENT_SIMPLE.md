# Simple Deployment to Render - No Code Changes Needed!

## Why Render?
- ✅ Supports Node.js + SQLite out of the box
- ✅ Free tier available
- ✅ Zero code changes required
- ✅ Auto-deploys from GitHub
- ✅ HTTPS included

## Step-by-Step (10 minutes)

### Step 1: Push to GitHub

```powershell
# If not already a git repo:
git init
git add .
git commit -m "Initial commit"

# Create repo on GitHub, then:
git remote add origin https://github.com/YourUsername/EventManager.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com and sign up (free, use GitHub login)

2. Click **New +** → **Web Service**

3. Connect your GitHub repo and select `EventManager`

4. Configure (most fields auto-detect):
   - **Name**: eventmanager (or your choice)
   - **Region**: Frankfurt (or closest to you)
   - **Branch**: main
   - **Root Directory**: (leave blank)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Click **Advanced** and add these environment variables:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = (generate random string, e.g., `kj3h4kj5h3k4j5h3k45jh`)

6. Click **Create Web Service**

7. Wait ~3-5 minutes for deployment

### Step 3: Initialize Database (One-time)

After first deployment:

1. In Render dashboard, go to your service
2. Click **Shell** tab (in the left sidebar)
3. Run this command:
   ```bash
   npm run init-db
   ```
4. You should see "Baza podatkov je uspešno inicializirana!"

### Step 4: Test Your Site

Your site will be live at: `https://eventmanager-XXXX.onrender.com`

Test login:
- Admin: `admin@eventmanager.si` / `admin123`
- User: `test@eventmanager.si` / `test123`

## Important Notes

### Database Persistence

⚠️ **Free Render instances have ephemeral storage** - your SQLite database will be reset when:
- You redeploy
- The service restarts after 15 minutes of inactivity
- You manually restart the service

**Solutions:**
1. **Quick fix**: Just re-run `npm run init-db` in the Shell when data is lost
2. **Permanent fix** (costs $7/month): Upgrade to Render's persistent disk
3. **Better fix** (still free): Migrate to a hosted database (I can help if needed)

For a course project/demo, option #1 is totally fine!

### Auto-Sleep on Free Tier

Free Render services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

## Troubleshooting

**Build fails with "Cannot find module 'express'"**
- Make sure `package.json` has all dependencies
- Check Build Command is `npm install`

**Database not found error**
- Run `npm run init-db` in the Render Shell

**Session issues / can't login**
- Make sure SESSION_SECRET environment variable is set

## Alternative: Paid Hosting with Persistence

If you need persistent SQLite (no data loss on restart):

**Render Paid ($7/month)**
- Add Persistent Disk to your service
- Database survives restarts

**Railway ($5/month credit free)**
- Similar to Render but includes persistent disk on free tier
- Deploy process is similar

## Cost Summary

- **Render Free Tier**: $0 (perfect for demos, data resets on sleep)
- **Render + Persistent Disk**: $7/month (data never lost)
- **Railway**: $5 free credit/month (persistent included)

For your course project, free tier is perfect! Just be aware of the data reset behavior.

## Quick Commands Reference

```powershell
# Test locally
npm install
npm run init-db
npm start

# Push changes
git add .
git commit -m "Your changes"
git push

# Render auto-deploys from GitHub!
```

## Need Help?

- Render docs: https://render.com/docs
- Re-initialize DB: Run `npm run init-db` in Render Shell
- Check logs: Render Dashboard → Logs tab
