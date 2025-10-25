# Genesis Quick Start - My-ERP-Plan

**Emergency Response Planning SaaS Platform**

## 🚀 60-Second Setup

```bash
# 1. Clone and install
git clone https://github.com/klatt42/my-erp-plan.git
cd my-erp-plan
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials (see below)

# 3. Set up database
# Run migrations in Supabase dashboard:
# - supabase/migrations/001_initial_schema.sql
# - supabase/migrations/006_remove_trigger.sql

# 4. Start development
npm run dev
# Open http://localhost:3000
```

## 🔄 Terminal Restart (After PC Reboot)

```bash
# Quick restart for existing developers
cd ~/projects/genesis-skills-test/my-erp-plan
./restart-project.sh

# This script will:
# - Check git status
# - Show current branch
# - Display TAB 1 and TAB 2 setup instructions
# - Provide context recovery prompt for Claude Code
```

## 📋 Required Credentials

```bash
# Supabase (get from https://supabase.com/dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic API (get from https://console.anthropic.com)
ANTHROPIC_API_KEY=sk-ant-api03-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=My-ERP-Plan
NODE_ENV=development
```

## 🏗️ Project Architecture

**Stack**: Next.js 14 + TypeScript + Supabase + Anthropic Claude + Tailwind CSS

**Key Directories**:
```
app/
├── (auth)/              # Login, signup, verify-email
├── (dashboard)/         # Protected dashboard pages
│   └── [orgId]/        # Organization-specific pages
└── api/                 # API routes (orgs, plans, auth)

components/
├── ui/                  # shadcn/ui components
├── auth/               # Authentication forms
└── dashboard/          # Dashboard components

lib/
├── supabase/           # Supabase clients (client, server, middleware)
├── anthropic/          # Claude API integration
├── validations/        # Zod schemas
└── types/              # TypeScript types
```

## 🔑 Key Features

- ✅ **Multi-tenant**: Organization-based data isolation with RLS
- ✅ **Authentication**: Supabase Auth (signup, login, email verification)
- ✅ **AI-Powered**: Claude API for ERP generation (ready for Phase 2)
- ✅ **Secure**: Row Level Security on all database tables
- ✅ **Role-Based**: Admin, Editor, Viewer permissions

## 🎯 Test the Setup

```bash
# 1. Sign up
# Navigate to: http://localhost:3000/signup
# Create account with your email

# 2. Verify email
# Check your email and click verification link

# 3. Create organization
# Fill out onboarding form at: http://localhost:3000/onboarding

# 4. Access dashboard
# You should see: http://localhost:3000/[org-id]
```

## 📚 Documentation Map

| Doc | Purpose |
|-----|---------|
| **README.md** | Complete setup & usage guide |
| **PROJECT_STATUS.md** | Current project state & progress |
| **PHASE_1_COMPLETE.md** | Phase 1 accomplishments |
| **RLS_FIX_SUMMARY.md** | Service role pattern explanation |
| **AUTHENTICATION_TEST_GUIDE.md** | Step-by-step auth testing |
| **GENESIS_SKILLS_GUIDE.md** | Using Genesis Skills for development |
| **NETLIFY_DEPLOYMENT.md** | Production deployment guide |
| **PAYMENT_INTEGRATION_OPTIONS.md** | GHL vs Stripe comparison |

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server (port 3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
# Run in Supabase SQL Editor:
# 1. Copy contents of supabase/migrations/001_initial_schema.sql
# 2. Copy contents of supabase/migrations/006_remove_trigger.sql

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push                 # Push to GitHub
```

## ⚡ Quick Troubleshooting

**Problem**: "Invalid API key"
```bash
# Solution: Restart dev server
pkill -f next-dev
npm run dev
```

**Problem**: "RLS policy violation"
```bash
# Check: Are you logged in?
# Check: Does user have organization membership?
# See: RLS_FIX_SUMMARY.md for details
```

**Problem**: "Module not found"
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

## 🎓 Genesis Skills Integration

For Phase 2+ development, use Genesis Skills:

```bash
# Skills are located at:
~/.claude/skills/genesis/

# Key skills for this project:
# - genesis-saas-app (multi-tenant patterns)
# - genesis-supabase (database & RLS)
# - genesis-troubleshooting (debugging)
# - genesis-copilotkit (AI features)
```

**Invoke with**: "Use genesis-[skillname] skill" in prompts to Claude Code

See: **GENESIS_SKILLS_GUIDE.md** for detailed invocation patterns

## 🚦 Current Status

**Phase**: Phase 2 Week 2 Complete ✅ | Phase 2 Week 3 Ready 🚀

**What Works**:
- ✅ Authentication (signup, login, email verification)
- ✅ Organization creation and management
- ✅ Dashboard with navigation
- ✅ Protected routes and middleware
- ✅ Multi-tenant database with RLS
- ✅ API routes for organizations and plans
- ✅ AI-powered ERP generation with Claude 4
- ✅ Multi-step onboarding questionnaire (6 steps)
- ✅ Plan display with markdown rendering
- 🚧 PDF export functionality (in progress)
- 🚧 Plan versioning (in progress)
- 🚧 Quick plan creation (in progress)

**Next Steps** (Phase 2 Week 3):
- Complete and test PDF export
- Complete plan versioning system
- Add plan activation workflow
- Resource management (personnel, equipment, facilities)
- Emergency mode features

## 🔗 Quick Links

- **GitHub**: https://github.com/klatt42/my-erp-plan
- **Local Dev**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Anthropic Console**: https://console.anthropic.com

## 💡 Pro Tips

1. **Service Role Pattern**: API routes use service role for admin operations (see RLS_FIX_SUMMARY.md)
2. **Genesis Skills**: Invoke early and often for faster development
3. **RLS Testing**: Test with multiple users to verify data isolation
4. **Documentation**: Keep PROJECT_STATUS.md updated as you build
5. **Commits**: Commit frequently with descriptive messages

## 🆘 Need Help?

1. Check **PROJECT_STATUS.md** - What's the current state?
2. Check **README.md** - Comprehensive guide
3. Check specific docs - Each covers a focused topic
4. Check **.github/CLAUDE_CODE_REMINDER.md** - Context recovery for Claude Code

---

**Last Updated**: October 25, 2025 (After PC Reboot - Terminal Restarted)
**Phase**: Phase 2 Week 2 Complete - Ready for Phase 2 Week 3
**Generated with**: Genesis patterns + Claude Code
**Restart Script**: `./restart-project.sh` available for quick terminal recovery
