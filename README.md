# My-ERP-Plan

AI-powered Emergency Response Planning SaaS platform. Generate, manage, and maintain comprehensive emergency response plans using Claude AI.

## 🔄 Quick Restart (After PC Reboot)

```bash
cd ~/projects/genesis-skills-test/my-erp-plan
./restart-project.sh
```

This will guide you through terminal setup and provide Claude Code context recovery instructions.

## Features

- Multi-tenant SaaS architecture with organization-based isolation
- AI-powered emergency plan generation using Anthropic Claude
- Complete authentication system (signup, login, email verification, password reset)
- Role-based access control (Admin, Editor, Viewer)
- Resource management (Personnel, Equipment, Facilities)
- Team collaboration and management
- Subscription billing and plan management
- Real-time updates with Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Row Level Security (RLS)
- **AI**: Anthropic Claude API
- **Deployment**: Netlify (configured)
- **Validation**: Zod schemas with react-hook-form

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Anthropic API account
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/klatt42/my-erp-plan.git
cd my-erp-plan
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=My-ERP-Plan
NODE_ENV=development
```

**Getting your credentials:**

- **Supabase**: Create project at [supabase.com](https://supabase.com) → Project Settings → API
- **Anthropic**: Get API key from [console.anthropic.com](https://console.anthropic.com)

### 4. Set Up Database

Run the SQL migrations in your Supabase SQL Editor in order:

```bash
# Run each migration file in order:
supabase/migrations/001_initial_schema.sql
supabase/migrations/006_remove_trigger.sql
```

**Important**: Migration 006 is the final working migration. Migrations 002-005 were intermediate fixes and are not required.

The migrations will create:
- 10 database tables with relationships
- Row Level Security (RLS) policies
- Indexes for performance
- Initial schema for multi-tenant architecture

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
my-erp-plan/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, signup, etc.)
│   ├── (dashboard)/              # Protected dashboard pages
│   ├── api/                      # API routes
│   │   ├── orgs/                 # Organization management
│   │   └── plans/                # Emergency plan generation
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── auth/                     # Auth-related components
│   └── dashboard/                # Dashboard components
├── lib/                          # Utilities and configurations
│   ├── supabase/                 # Supabase clients (client, server, middleware)
│   ├── validations/              # Zod schemas
│   └── utils.ts                  # Utility functions
├── supabase/                     # Database migrations
│   └── migrations/               # SQL migration files
├── public/                       # Static assets
└── .env                          # Environment variables (gitignored)
```

## Database Schema

**Core Tables:**
- `organizations` - Multi-tenant organization data
- `organization_members` - User-org relationships with roles
- `emergency_plans` - Generated emergency response plans
- `plan_versions` - Plan version history
- `resources` - Personnel, equipment, facilities
- `teams` - Team management
- `subscriptions` - Billing and plan tiers
- `activity_logs` - Audit trail

**Security:**
- Row Level Security (RLS) enabled on all tables
- Organization-based data isolation
- Role-based access control

## Authentication Flow

1. **Sign Up**: Create account at `/auth/signup`
2. **Email Verification**: Check email and verify account
3. **Create Organization**: Complete onboarding at `/onboarding`
4. **Access Dashboard**: Navigate to `/{org-id}` dashboard

See `AUTHENTICATION_TEST_GUIDE.md` for detailed testing steps.

## API Routes

### Organizations
- `GET /api/orgs` - List user's organizations
- `POST /api/orgs` - Create new organization

### Emergency Plans
- `GET /api/plans?orgId={id}` - List organization plans
- `POST /api/plans` - Generate new plan with AI
- `GET /api/plans/[id]` - Get specific plan
- `PUT /api/plans/[id]` - Update plan
- `DELETE /api/plans/[id]` - Delete plan

## RLS Architecture

**Service Role Pattern**: Administrative operations (like organization creation) use the Supabase service role client to bypass RLS policies:

```typescript
// API routes use service role for admin operations
const supabaseAdmin = createServiceClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Frontend uses regular client for user operations
const supabase = createClient(); // Subject to RLS
```

**Why**: Prevents circular reference issues in RLS policies during organization creation.

## Development

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding UI Components

This project uses shadcn/ui. Add components with:

```bash
npx shadcn-ui@latest add [component-name]
```

## Deployment

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables in Netlify dashboard
4. Deploy

See `NETLIFY_DEPLOYMENT.md` for detailed instructions.

## Payment Integration

Payment processing options are documented in `PAYMENT_INTEGRATION_OPTIONS.md`:
- GoHighLevel (recommended for Phase 1)
- Stripe (alternative)

## Genesis Skills

This project was generated using Genesis SaaS creation patterns. For Phase 2 development, see `GENESIS_SKILLS_GUIDE.md` for using Genesis Skills to add features.

## Phase 1 Complete

Phase 1 (Genesis Foundation) is complete with:
- Complete Next.js 14 App Router structure
- Multi-tenant database with RLS
- Authentication system
- Dashboard with navigation
- Organization management
- API routes with TypeScript
- AI integration ready

See `PHASE_1_COMPLETE.md` for full details.

## Troubleshooting

### Database Permission Errors

If you see RLS policy violations:
- Ensure you've run all migrations in order
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check that organization_members table has your user_id

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Authentication Issues

- Verify Supabase URL and keys are correct
- Check email confirmation settings in Supabase Auth
- Ensure redirect URLs are configured in Supabase

## Contributing

This is a private project. For issues or questions, contact the repository owner.

## License

Proprietary - All rights reserved

## Support

For questions or issues:
- Check documentation files in the repository
- Review Phase 1 completion guide
- Contact: [Your contact information]

---

Generated with [Claude Code](https://claude.com/claude-code) using Genesis SaaS patterns.
