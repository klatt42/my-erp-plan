# Genesis Skills for Existing Projects - Enhancement Guide

**Date**: October 24, 2025
**Projects**: my-erp-plan, SERP-Master
**Goal**: Invoke Skills going forward without restarting

---

## 🎯 STRATEGY: ENHANCEMENT NOT RESTART

**What We're Doing:**
- ✅ Keep all existing code and progress
- ✅ Invoke Genesis Skills for new features
- ✅ Use Skills for refactoring/improvements
- ✅ Apply Genesis patterns incrementally

**What We're NOT Doing:**
- ❌ Starting over from scratch
- ❌ Discarding existing work
- ❌ Full project regeneration

---

## 📋 PROJECT 1: MY-ERP-PLAN

### Current Status
- ✅ Next.js 14 project initialized
- ✅ 67 files generated (manual implementation)
- ✅ Database schema created and migrated
- ✅ Dev server running
- ✅ Code pushed to GitHub
- Need: Skills for ongoing development

### Enhancement Invocation Pattern

**In Claude Code (in my-erp-plan directory):**

```
Enhance my-erp-plan project using Genesis Skills going forward:

CURRENT PROJECT STATE:
- Next.js 14 application with 67 files
- Directory: ~/projects/genesis-skills-test/my-erp-plan
- Database schema deployed to Supabase (10 tables)
- Manual implementation completed for Phase 1
- Dev server running on localhost:3000

PROJECT PURPOSE:
- Multi-tenant SaaS for emergency response planning
- Cultural institutions focus
- Emergency plan management
- Resource coordination

WHAT I NEED GENESIS SKILLS FOR:
1. Feature Development (Phase 2)
   - Use genesis-copilotkit skill for AI plan generation
   - Use genesis-forms skill for onboarding questionnaire
   - Use genesis-analytics skill for dashboard metrics

2. Authentication Enhancement
   - Use genesis-auth skill
   - Add password reset flow
   - Add email verification UI
   - Add session management

3. Advanced Features
   - Use genesis-supabase skill for realtime features
   - Use genesis-deployment skill for production setup
   - Use genesis-testing skill for test coverage

TECH STACK:
- Next.js 14 App Router + TypeScript ✅
- Supabase (database + auth + realtime) ✅
- Tailwind CSS + shadcn/ui ✅
- Anthropic Claude API (configured)
- Zod + React Hook Form ✅

INSTRUCTION:
Use Genesis Skills to generate the next Phase 2 features. Keep existing files intact, add new Genesis-pattern components for AI generation, onboarding, and advanced features.

Which Genesis Skills will you use for Phase 2 development?
```

### What Genesis Skills Can Add

**New Features for Phase 2:**
```
my-erp-plan/
├── lib/
│   ├── anthropic/
│   │   ├── prompts.ts (Genesis - AI generation patterns)
│   │   └── streaming.ts (Genesis - Real-time AI)
│   └── copilotkit/
│       └── config.ts (Genesis - CopilotKit setup)
├── app/
│   ├── (dashboard)/
│   │   ├── [orgId]/
│   │   │   ├── ai-generator/
│   │   │   │   └── page.tsx (Genesis - AI ERP generation)
│   │   │   └── emergency/
│   │   │       └── [incidentId]/
│   │   │           └── page.tsx (Genesis - Emergency mode)
│   │   └── onboarding/
│   │       └── steps/
│   │           └── *.tsx (Genesis - Multi-step forms)
└── components/
    ├── copilotkit/
    │   └── *.tsx (Genesis - AI components)
    └── emergency/
        └── *.tsx (Genesis - Emergency features)
```

---

## 📋 PROJECT 2: SERP-MASTER

### Current Status
- Mature Next.js application
- Existing keyword analysis features
- Custom codebase architecture
- Need: Skills for new features only

### Enhancement Invocation Pattern

**In Claude Code (in SERP-Master directory):**

```
Enhance SERP-Master using Genesis Skills for new features:

EXISTING PROJECT:
- Directory: ~/projects/serp-master
- Next.js 14 application
- Keyword analysis and SERP tracking
- Custom architecture (preserve existing code)

WHAT I NEED GENESIS SKILLS FOR:
1. Keyword Gap Analysis Feature
   - Use genesis-analytics skill
   - Algorithm design patterns
   - Data structure optimization
   - Performance patterns

2. Supabase Integration
   - Use genesis-supabase skill
   - Add data persistence
   - Keep existing features working
   - Incremental migration

3. Enhanced Analytics Dashboard
   - Use genesis-analytics skill
   - Dashboard component patterns
   - Chart integration
   - Real-time updates

4. TypeScript Improvements
   - Use genesis-typescript skill
   - Add types to new features
   - Zod validation for new endpoints
   - Don't break existing code

TECH STACK:
- Next.js 14 (existing)
- Add: Supabase for persistence
- TypeScript (enhance)
- Existing custom components (keep)

INSTRUCTION:
Use Genesis Skills to generate NEW features and components. Do NOT modify existing working code unless I explicitly ask. Focus on incremental enhancement with Genesis patterns for new additions.

Which Genesis Skills will you use?
```

---

## 🔑 KEY INVOCATION PRINCIPLES

### 1. Always Mention "Genesis Skills"
```
❌ "Help me add authentication"
✅ "Use Genesis Skills to add authentication"
```

### 2. Specify Which Skills You Want
```
❌ "Add a database"
✅ "Use genesis-supabase skill to add database"
```

### 3. State "Enhancement" Not "Create"
```
❌ "Create a new project"
✅ "Enhance existing project using Genesis Skills"
```

### 4. Protect Existing Code
```
✅ "Keep existing files intact"
✅ "Add new Genesis components alongside"
✅ "Don't modify working code"
```

### 5. Be Feature-Specific
```
❌ "Improve the project"
✅ "Use genesis-auth skill to add authentication feature"
```

---

## 🎯 ONGOING USAGE PATTERNS

### For Each New Feature

**Template:**
```
Add [FEATURE_NAME] to my-erp-plan using Genesis Skills:

FEATURE REQUIREMENTS:
- [Specific requirement 1]
- [Specific requirement 2]

GENESIS SKILLS TO USE:
- genesis-[skill-name] for [purpose]
- genesis-[skill-name] for [purpose]

EXISTING CODE:
- Keep all current functionality
- Add new Genesis components

Generate the implementation using Genesis patterns.
```

### For Refactoring

**Template:**
```
Refactor [COMPONENT/FEATURE] in my-erp-plan using Genesis patterns:

CURRENT STATE:
- [What exists now]
- [What works]

IMPROVEMENT GOALS:
- [What to improve]
- [Why]

USE GENESIS SKILLS:
- genesis-refactor for modernization
- genesis-[specific-skill] for [purpose]

CONSTRAINTS:
- Maintain existing functionality
- Don't break current features
- Apply Genesis patterns incrementally

Provide refactoring plan and implementation.
```

---

## 📊 VERIFICATION CHECKLIST

### After Each Skills Invocation

**Ask Claude Code:**
```
"Which Genesis Skills did you use for this implementation?"
```

**Expected Response Format:**
```
✅ genesis-supabase - Database schema and migrations
✅ genesis-auth - Authentication flows
✅ genesis-typescript - Type definitions
✅ genesis-saas-app - Dashboard patterns
```

---

## 🚀 NEXT STEPS FOR PHASE 2

### Use Genesis Skills for:

**Week 2 Features:**
```
Use Genesis Skills to add AI-powered ERP generation to my-erp-plan:

FEATURES NEEDED:
- Onboarding questionnaire (multi-step form)
- Claude API integration for plan generation
- Facility profile to ERP conversion
- Plan preview and editing

USE GENESIS SKILLS:
- genesis-copilotkit for AI integration patterns
- genesis-forms for multi-step questionnaire
- genesis-anthropic for Claude API patterns

Keep existing foundation intact, add AI features.
```

**Week 3 Features:**
```
Use Genesis Skills to add plan management to my-erp-plan:

FEATURES NEEDED:
- Plan editor with auto-save
- Version control
- PDF export
- Real-time collaboration

USE GENESIS SKILLS:
- genesis-forms for rich text editing
- genesis-supabase for realtime sync
- genesis-deployment for PDF generation

Add alongside existing pages.
```

---

## 💡 PRO TIPS

### 1. Start Small
- Don't try to invoke all skills at once
- Start with one feature (e.g., AI generation)
- Verify it works, then add next feature

### 2. Verify Each Step
- After each invocation, ask which skills were used
- Confirm Genesis patterns are applied
- Check code quality matches Genesis standards

### 3. Incremental Integration
- Add Genesis components alongside existing code
- Test each addition
- Gradually enhance with Genesis patterns

---

## ✅ CURRENT PROJECT STATUS

### my-erp-plan Phase 1 Complete:
- ✅ 67 files generated
- ✅ Database migrated (10 tables)
- ✅ Auth foundation ready
- ✅ Dev server running
- ✅ Code on GitHub
- ⏭️ Ready for Phase 2 with Genesis Skills

### Next Invocation:
```
Use Genesis Skills to build Phase 2 features for my-erp-plan:
- AI-powered ERP generation
- Onboarding questionnaire
- Emergency mode features

Start with genesis-copilotkit skill for AI integration.
```

---

**Status**: 🟢 Ready for Genesis Skills Enhancement
**Current Phase**: Phase 1 Complete, Phase 2 Ready
**Approach**: Incremental enhancement with Genesis patterns

*Use Genesis Skills for all new features going forward while preserving the solid foundation already built.*
