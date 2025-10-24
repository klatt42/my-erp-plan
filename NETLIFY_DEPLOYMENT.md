# Netlify Deployment Guide for My-ERP-Plan

## Overview
Since you already have a Netlify account connected to GitHub, this guide will walk you through deploying My-ERP-Plan to production using Netlify's GitHub integration.

---

## Pre-Deployment Checklist

### 1. Verify GitHub Repository
- [x] Repository created: `https://github.com/klatt42/my-erp-plan`
- [ ] Repository initialized with Git
- [ ] Initial code committed and pushed
- [ ] `.gitignore` properly configured (`.env` files excluded)

### 2. Environment Variables Ready
- [x] Supabase credentials documented
- [x] Anthropic API key documented
- [ ] Payment integration selected (GHL or Stripe)
- [ ] Production environment variables prepared

### 3. Production Supabase Project
- [ ] Create production Supabase project (separate from dev)
- [ ] Run database migrations
- [ ] Configure RLS policies
- [ ] Get production API keys

---

## Step-by-Step Deployment

### Step 1: Create Production Supabase Project

**In Supabase Dashboard** (https://supabase.com/dashboard):
1. Click "New Project"
2. Name: `my-erp-plan-prod`
3. Database Password: Generate strong password (save securely!)
4. Region: Choose closest to your users (e.g., `us-east-1`)
5. Click "Create new project" (takes ~2 minutes)

**Run Migrations**:
1. Go to SQL Editor in Supabase Dashboard
2. Create new query
3. Paste your migration SQL from `/supabase/migrations/`
4. Click "Run"
5. Verify all tables created

**Get Production Credentials**:
1. Settings → API
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key
3. Save these for Netlify environment variables

---

### Step 2: Prepare Next.js for Netlify

**Install Netlify Adapter** (if using App Router):

```bash
cd ~/projects/genesis-skills-test/my-erp-plan
npm install -D @netlify/plugin-nextjs
```

**Create `netlify.toml`** in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "20"

# Redirect rules for Next.js App Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Security headers
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

**Update `package.json`** scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "postbuild": "next-sitemap"
  }
}
```

---

### Step 3: Connect GitHub to Netlify

**In Netlify Dashboard** (https://app.netlify.com):

1. **Click "Add new site"**
   - Select "Import an existing project"

2. **Connect to Git Provider**
   - Click "GitHub"
   - Authorize Netlify (if not already authorized)
   - Search for: `my-erp-plan`
   - Click on your repository

3. **Configure Build Settings**
   - **Owner**: Your Netlify team/account
   - **Branch to deploy**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: (leave empty for now)

4. **Click "Deploy site"** (will fail initially - we need env vars first)

---

### Step 4: Configure Environment Variables

**In Netlify Site Settings**:

1. Go to: **Site settings → Environment variables**

2. **Add Production Variables**:

Click "Add a variable" for each:

```bash
# Supabase Production
NEXT_PUBLIC_SUPABASE_URL = https://[your-prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-prod-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-prod-service-role-key]

# Anthropic
ANTHROPIC_API_KEY = sk-ant-api03-[your-key]

# App Configuration
NEXT_PUBLIC_APP_URL = https://your-site-name.netlify.app
NEXT_PUBLIC_APP_NAME = My-ERP-Plan

# Payment (Choose one)
# For GHL:
GHL_API_KEY = [your-ghl-api-key]
GHL_LOCATION_ID = [your-ghl-location-id]

# For Stripe (if chosen):
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_[your-key]
# STRIPE_SECRET_KEY = sk_live_[your-key]
# STRIPE_WEBHOOK_SECRET = whsec_[your-webhook-secret]

# Environment
NODE_ENV = production
```

3. **Click "Save"**

---

### Step 5: Trigger Deployment

**Option A: Via Netlify Dashboard**
1. Go to **Deploys** tab
2. Click "Trigger deploy" → "Deploy site"

**Option B: Via Git Push**
```bash
cd ~/projects/genesis-skills-test/my-erp-plan
git add .
git commit -m "Configure Netlify deployment"
git push origin main
```

**Deployment Process**:
- Netlify will automatically start building
- Watch build logs in real-time
- Build takes ~3-5 minutes
- If successful: Site is live!

---

### Step 6: Configure Custom Domain (Optional)

**If you have a domain** (e.g., `my-erp-plan.com`):

1. **In Netlify**:
   - Site settings → Domain management
   - Click "Add custom domain"
   - Enter: `my-erp-plan.com` and `www.my-erp-plan.com`
   - Netlify will provide DNS records

2. **In Your Domain Registrar** (e.g., Namecheap, GoDaddy):
   - Add A record pointing to Netlify's IP (provided in Netlify)
   - Add CNAME for `www` pointing to your Netlify subdomain
   - Wait 5-30 minutes for DNS propagation

3. **Enable HTTPS**:
   - Netlify automatically provisions SSL certificate
   - Usually takes 1-5 minutes
   - Once ready, enable "Force HTTPS"

4. **Update Environment Variables**:
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain
   - Redeploy

---

### Step 7: Post-Deployment Testing

**Test Checklist**:

```bash
# Authentication Flow
- [ ] Visit production URL
- [ ] Sign up with new email
- [ ] Verify email confirmation works
- [ ] Log in successfully
- [ ] Password reset works

# Core Features
- [ ] Create organization
- [ ] Navigate dashboard
- [ ] All pages load without errors
- [ ] Images/assets loading correctly
- [ ] API routes responding

# Performance
- [ ] Check Lighthouse score (aim for 90+)
- [ ] Verify page load times <3 seconds
- [ ] Test on mobile devices
- [ ] Check all major browsers (Chrome, Firefox, Safari)

# Security
- [ ] HTTPS enforced
- [ ] Environment variables not exposed
- [ ] Console has no errors
- [ ] API keys not visible in network tab
```

---

## Netlify-Specific Features to Leverage

### 1. Deploy Previews
- Every pull request gets a preview URL
- Test changes before merging to main
- Great for showing features to stakeholders

### 2. Branch Deploys
```bash
# Deploy from staging branch
git checkout -b staging
git push origin staging

# In Netlify: Enable branch deploys for 'staging'
```

### 3. Netlify Functions (for serverless)
- Use for webhook handlers
- GHL/Stripe webhook endpoints
- Scheduled tasks (cron jobs)

### 4. Form Handling
- Built-in form submissions
- Spam filtering included
- Good for contact/demo request forms

### 5. Analytics
- Enable Netlify Analytics (optional, $9/month)
- Or use free Google Analytics 4

---

## Continuous Deployment Workflow

**Standard Workflow**:
```bash
# 1. Develop locally
npm run dev

# 2. Test changes
npm run build
npm start

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 4. Netlify auto-deploys
# Watch at: https://app.netlify.com/sites/[your-site]/deploys

# 5. Production is updated automatically
```

**Rollback if Issues**:
1. Go to Netlify Deploys tab
2. Find last good deploy
3. Click "Publish deploy"
4. Instant rollback!

---

## Environment Management

### Development
```bash
# .env.local (local development)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NODE_ENV=development
```

### Staging (Optional)
```bash
# Netlify environment variables for 'staging' branch
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NODE_ENV=staging
```

### Production
```bash
# Netlify environment variables for 'main' branch
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NODE_ENV=production
```

---

## Troubleshooting Common Issues

### Build Fails with "Module not found"
```bash
# Ensure all dependencies in package.json
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Environment Variables Not Working
- Check spelling (case-sensitive!)
- Ensure `NEXT_PUBLIC_` prefix for client-side variables
- Redeploy after adding new env vars

### 404 on Sub-Routes
- Verify `netlify.toml` redirect rules present
- Check Next.js routing configuration

### Slow Build Times
- Enable build caching in Netlify settings
- Consider build optimizations
- Typical build: 3-5 minutes (acceptable)

---

## Costs

### Netlify Pricing (as of 2025)
- **Starter (Free)**:
  - 100 GB bandwidth/month
  - 300 build minutes/month
  - Perfect for MVP/early stage

- **Pro ($19/month)**:
  - 1 TB bandwidth/month
  - Unlimited build minutes
  - Background functions
  - Upgrade when you hit limits

### Recommendation
- Start with **Free tier**
- Monitor bandwidth usage
- Upgrade to Pro when you reach ~50 active users

---

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore` ✓

2. **Use environment variables for all secrets**
   - Configured in Netlify dashboard ✓

3. **Rotate API keys regularly**
   - Especially after team changes
   - Every 90 days recommended

4. **Enable Netlify Identity** (future)
   - For admin-only routes
   - Two-factor authentication

5. **Monitor Deploy Logs**
   - Check for leaked secrets
   - Review build warnings

---

## Next Steps After Deployment

1. **Set up monitoring**
   - [ ] Configure error tracking (Sentry)
   - [ ] Set up uptime monitoring (UptimeRobot)
   - [ ] Enable Netlify Analytics or GA4

2. **Configure webhooks**
   - [ ] GHL webhook endpoint
   - [ ] Supabase webhooks (if needed)
   - [ ] Set up Netlify Functions for webhook handlers

3. **Performance optimization**
   - [ ] Enable image optimization
   - [ ] Configure caching headers
   - [ ] Set up CDN if needed

4. **Backup strategy**
   - [ ] Supabase automated backups (daily)
   - [ ] Git repository backup
   - [ ] Database export schedule

---

## Quick Reference

### Deploy Status Badge
Add to README.md:
```markdown
[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
```

### Useful Netlify CLI Commands
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Link to site
netlify link

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod

# View build logs
netlify watch

# Open site in browser
netlify open:site
```

---

## Deployment Checklist Summary

**Before First Deploy**:
- [x] GitHub repository created and connected
- [ ] Production Supabase project created
- [ ] All environment variables documented
- [ ] `netlify.toml` created
- [ ] Payment integration decided (GHL recommended)

**Deploy Process**:
- [ ] Connect GitHub to Netlify
- [ ] Configure build settings
- [ ] Add environment variables
- [ ] Trigger first deploy
- [ ] Test production site
- [ ] Configure custom domain (optional)

**Post-Deploy**:
- [ ] Test all critical paths
- [ ] Set up monitoring
- [ ] Configure webhooks
- [ ] Document deployment process
- [ ] Train team on deployment workflow

---

**Your Netlify deployment is configured and ready!**

Since you already have:
- ✓ Netlify account connected to GitHub
- ✓ GitHub repository created
- ✓ Environment variables prepared

You're just a few clicks away from having My-ERP-Plan live in production!

**Estimated time to deploy**: 30-45 minutes
