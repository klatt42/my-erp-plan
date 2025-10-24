# Claude Code Context Recovery - My-ERP-Plan

> **Purpose**: This file helps Claude Code quickly recover project context when starting a new session.

---

## 🎯 Project Identity

**Name**: My-ERP-Plan
**Type**: Multi-tenant SaaS Application (Emergency Response Planning)
**Phase**: Phase 1 Complete ✅ | Phase 2 Ready 🚀
**Stack**: Next.js 14 + TypeScript + Supabase + Anthropic Claude

---

## 📖 Essential Reading Order

When starting a new Claude Code session, read these files **in this order**:

### 1. **GENESIS_QUICK_START.md** (2 min)
- 60-second setup guide
- Key commands and credentials
- Architecture overview
- Quick troubleshooting

### 2. **PROJECT_STATUS.md** (5 min)
- Current project state
- What's working vs what's pending
- Next steps for Phase 2
- Known issues and resolutions

### 3. **PHASE_1_COMPLETE.md** (3 min)
- What was accomplished in Phase 1
- Deliverables checklist
- Technology stack details
- Success metrics

### 4. **RLS_FIX_SUMMARY.md** (3 min) - CRITICAL
- Service role pattern for multi-tenant operations
- Why database triggers don't work with service role
- How organization creation works
- Key architectural pattern

### 5. **GENESIS_SKILLS_GUIDE.md** (2 min)
- How to properly use Genesis Skills
- Skill invocation patterns
- Which skills to use for Phase 2

**Total Reading Time**: ~15 minutes for complete context recovery

---

## 🚦 Current State Quick Reference

### What's Working ✅
- Authentication (signup, login, email verification)
- Organization creation and management
- Dashboard with navigation
- Protected routes with middleware
- Multi-tenant database with RLS
- API routes for organizations

### What's Ready for Phase 2 🔜
- AI-powered plan generation (Claude API integrated, needs implementation)
- Plan CRUD operations (API routes ready, UI needs connection)
- Onboarding questionnaire (needs design and implementation)
- Resource management (structure ready, needs features)

### Development Environment
- **Local Server**: http://localhost:3000
- **Status**: 2 dev server instances running
- **Build**: ✅ No errors
- **TypeScript**: ✅ No errors

---

## 🔑 Critical Patterns to Remember

### 1. Service Role Pattern (CRITICAL)
**When creating organizations or admin operations:**

```typescript
// API Route Pattern (app/api/orgs/route.ts)
export async function POST(request: Request) {
  // Step 1: Authenticate user with regular client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return error;

  // Step 2: Use service role for admin operation
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 3: Create resource with service role
  const { data: org } = await supabaseAdmin
    .from("organizations")
    .insert({...});

  // Step 4: Add membership with explicit user.id
  await supabaseAdmin
    .from("organization_members")
    .insert({
      org_id: org.id,
      user_id: user.id,  // ← Explicit from authenticated session
      role: "admin",
    });
}
```

**Why**: Database triggers don't work with service role (auth.uid() returns null). Handle membership explicitly in API route.

### 2. Genesis Skills Usage
**For Phase 2 development, invoke skills explicitly:**

```typescript
// ❌ DON'T: Use Task tool with generic prompts
Task({ subagent_type: "general-purpose", prompt: "Build feature..." })

// ✅ DO: Invoke Genesis Skills
Skill({ command: "genesis-saas-app" })      // Multi-tenant patterns
Skill({ command: "genesis-supabase" })      // Database & RLS
Skill({ command: "genesis-copilotkit" })    // AI integration
Skill({ command: "genesis-troubleshooting" }) // When errors occur
```

### 3. Multi-Tenant RLS
**Every table has RLS enabled and policies:**

```sql
-- Standard pattern for user-owned resources
CREATE POLICY "Users can CRUD own data"
  ON table_name FOR ALL
  USING (auth.uid() = user_id);
```

**For organization-based resources:**

```sql
-- Check organization membership
CREATE POLICY "Members can access org data"
  ON table_name FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );
```

---

## 🗂️ File Structure Quick Map

```
app/
├── (auth)/                    # Login, signup, verify-email, reset-password
├── (dashboard)/               # Protected dashboard
│   ├── [orgId]/              # Org-specific pages
│   │   ├── page.tsx          # Main dashboard
│   │   ├── plans/            # Plan management (ready for Phase 2)
│   │   ├── resources/        # Resource management (ready for Phase 2)
│   │   ├── team/             # Team management
│   │   ├── settings/         # Org settings
│   │   └── billing/          # Subscription billing
│   └── onboarding/           # Create organization (working ✅)
└── api/
    ├── orgs/route.ts         # Organization CRUD (working ✅)
    ├── plans/route.ts        # Plan generation (ready for Phase 2)
    └── auth/                 # Auth callbacks

components/
├── ui/                        # shadcn/ui (11 components)
├── auth/                      # Login/signup forms (working ✅)
├── dashboard/                 # Sidebar, header, org-switcher (working ✅)
└── plans/                     # Plan card (ready for Phase 2)

lib/
├── supabase/
│   ├── client.ts             # Client-side Supabase
│   ├── server.ts             # Server-side Supabase
│   └── middleware.ts         # Auth middleware (working ✅)
├── anthropic/
│   └── client.ts             # Claude API client (ready for Phase 2)
├── validations/              # Zod schemas
└── types/                    # TypeScript types

supabase/migrations/
├── 001_initial_schema.sql    # 10 tables + RLS policies
└── 006_remove_trigger.sql    # Service role fix (CRITICAL)
```

---

## 🎯 Phase 2 Immediate Next Steps

### Week 2: AI-Powered ERP Generation
**Priority**: Start here when beginning Phase 2

**Tasks to Implement**:
1. **Onboarding Questionnaire**
   - Collect facility information
   - Industry type, size, location
   - Key personnel count
   - Special requirements

2. **Claude API Integration**
   - Use existing anthropic client (lib/anthropic/client.ts)
   - Create prompt templates for different facility types
   - Implement plan generation workflow
   - Parse Claude response into plan sections

3. **Plan Display**
   - Show generated plan in UI
   - Enable editing of sections
   - Save to database

**Genesis Skills to Use**:
- `genesis-copilotkit` - AI integration patterns
- `genesis-forms` - Questionnaire forms
- `genesis-saas-app` - CRUD operations

---

## 🔍 Common Questions & Answers

### Q: Why are there 2 dev servers running?
**A**: Background processes that weren't killed. Safe to ignore or kill if needed:
```bash
pkill -f "next-dev"
npm run dev
```

### Q: Where are the RLS policies?
**A**: In `supabase/migrations/001_initial_schema.sql` (lines ~200-500). Only migrations 001 and 006 are active. Migrations 002-005 were debugging attempts (keep for history).

### Q: How do I test multi-tenancy?
**A**: Create 2 users, 2 organizations. Try to access other user's org data - should be blocked by RLS.

### Q: What happened with the RLS errors?
**A**: 6 migrations tried different approaches. Final solution: remove database trigger, handle membership in API route with service role. See **RLS_FIX_SUMMARY.md**.

### Q: Can I modify the database schema?
**A**: Yes, but:
1. Create new migration file in `supabase/migrations/`
2. Run in Supabase SQL Editor
3. Update TypeScript types if needed
4. Ensure RLS policies added for new tables

### Q: Why wasn't Genesis Skills used in Phase 1?
**A**: Oversight - used Task tool instead of Skill tool. Resulted in 6 migrations vs 2-3 if skills were used. **Phase 2 must use Genesis Skills properly**.

---

## 🛠️ Quick Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Test production build
npm run lint             # Check for errors

# Database (run in Supabase SQL Editor)
# 1. Copy supabase/migrations/001_initial_schema.sql
# 2. Copy supabase/migrations/006_remove_trigger.sql

# Git workflow
git status               # Check current state
git add .                # Stage changes
git commit -m "msg"      # Commit
git push                 # Push to GitHub

# Troubleshooting
rm -rf .next node_modules
npm install
npm run dev
```

---

## 🚨 Red Flags to Watch For

### ❌ DON'T Do These Things

1. **Don't create database triggers that use auth.uid()** in service role context
   - Use explicit user.id from authenticated session instead

2. **Don't call Supabase directly from client-side** for admin operations
   - Use API routes with service role pattern

3. **Don't skip Genesis Skills** in Phase 2
   - Invoke skills explicitly: `Skill({ command: "genesis-skillname" })`

4. **Don't disable RLS** even temporarily
   - Fix policies instead, RLS is critical for multi-tenancy

5. **Don't commit .env files**
   - Already in .gitignore, but double-check

### ✅ DO These Things

1. **Use service role pattern** for admin operations (see RLS_FIX_SUMMARY.md)
2. **Invoke Genesis Skills** for all Phase 2 development
3. **Test with multiple users/orgs** to verify RLS isolation
4. **Update PROJECT_STATUS.md** as features are completed
5. **Commit frequently** with descriptive messages

---

## 📚 Documentation Hierarchy

**Quick Start** → `GENESIS_QUICK_START.md`
**Current State** → `PROJECT_STATUS.md` (most important)
**Phase 1 Summary** → `PHASE_1_COMPLETE.md`
**Technical Patterns** → `RLS_FIX_SUMMARY.md`
**Setup Guide** → `README.md`
**Testing** → `AUTHENTICATION_TEST_GUIDE.md`
**Development** → `GENESIS_SKILLS_GUIDE.md`
**Deployment** → `NETLIFY_DEPLOYMENT.md`
**Payments** → `PAYMENT_INTEGRATION_OPTIONS.md`

---

## 🎓 Key Learnings from Phase 1

1. **Genesis Skills should be invoked explicitly** - didn't happen in Phase 1, must happen in Phase 2
2. **Service role pattern is critical** for multi-tenant admin operations
3. **Database triggers don't work with service role** - handle in API routes instead
4. **Documentation is essential** - 10 docs created, makes context recovery fast
5. **RLS debugging is iterative** - took 6 migrations, but established correct pattern

---

## 💡 Pro Tips for Efficient Development

1. **Start every new feature** by invoking the appropriate Genesis Skill
2. **Keep PROJECT_STATUS.md updated** - future you will thank you
3. **Test RLS immediately** when creating new tables
4. **Use TypeScript types** - catch errors at compile time
5. **Commit after each working feature** - makes rollback easy

---

## 🔗 Essential Links

- **GitHub Repo**: https://github.com/klatt42/my-erp-plan
- **Local Dev**: http://localhost:3000
- **Supabase Dashboard**: https://supabase.com/dashboard (project: somxbiepkrhxlbxtvcbz)
- **Anthropic Console**: https://console.anthropic.com

---

## ✅ Context Recovery Checklist

When starting a new Claude Code session:

- [ ] Read GENESIS_QUICK_START.md
- [ ] Read PROJECT_STATUS.md
- [ ] Read PHASE_1_COMPLETE.md
- [ ] Read RLS_FIX_SUMMARY.md
- [ ] Read GENESIS_SKILLS_GUIDE.md
- [ ] Check dev server is running (npm run dev)
- [ ] Verify you understand service role pattern
- [ ] Ready to use Genesis Skills for Phase 2

**Estimated Time**: 15 minutes
**Result**: Full project context recovered, ready to develop

---

**Last Updated**: October 24, 2025
**Phase**: 1 Complete → Phase 2 Ready
**Next Context Update**: When Phase 2 Week 2 begins

---

> 💡 **Remember**: This is a Genesis project. Use Genesis Skills for all Phase 2+ development!
