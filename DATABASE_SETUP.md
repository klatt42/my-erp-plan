# Database Setup Guide

## Run Supabase Migration

You have a complete database schema ready at:
`/home/klatt42/projects/genesis-skills-test/my-erp-plan/supabase/migrations/001_initial_schema.sql`

### Option 1: Via Supabase Dashboard (Recommended for now)

1. **Open Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Select project: `my-erp-plan` (or create new one if needed)

2. **Navigate to SQL Editor**:
   - Left sidebar → SQL Editor
   - Click "+ New Query"

3. **Copy Migration SQL**:
   ```bash
   # In WSL, display the migration file:
   cat /home/klatt42/projects/genesis-skills-test/my-erp-plan/supabase/migrations/001_initial_schema.sql
   ```
   - Select all and copy

4. **Paste and Run**:
   - Paste into Supabase SQL Editor
   - Click "Run" button (bottom right)
   - Expected result: "Success. No rows returned"

5. **Verify Tables Created**:
   - Go to: Table Editor (left sidebar)
   - Should see 10 tables:
     - organizations
     - organization_members
     - emergency_plans
     - plan_sections
     - resources
     - emergency_contacts
     - incidents
     - incident_updates
     - audit_logs
     - subscriptions

### Option 2: Via Supabase CLI (If you have it installed)

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Initialize Supabase in project
cd /home/klatt42/projects/genesis-skills-test/my-erp-plan
supabase init

# Link to your remote project
supabase link --project-ref [your-project-ref]

# Push migration
supabase db push
```

### What the Migration Creates

#### 10 Tables with Full Schema:
1. **organizations** - Organization/tenant data
2. **organization_members** - User-org relationships with roles
3. **emergency_plans** - Emergency response plans
4. **plan_sections** - Plan content sections
5. **resources** - Personnel, equipment, facilities
6. **emergency_contacts** - Emergency contact directory
7. **incidents** - Active emergency incidents
8. **incident_updates** - Timeline of incident updates
9. **audit_logs** - System audit trail
10. **subscriptions** - Billing and subscription data

#### Security Features:
- **Row Level Security (RLS)** enabled on all tables
- **Organization-based isolation** - users only see their org's data
- **Role-based permissions**:
  - Admin: Full access
  - Editor: Create/edit (no delete)
  - Viewer: Read-only
- **Automatic audit logging** capability

#### Performance Optimizations:
- Indexes on all foreign keys
- Composite indexes for common queries
- Auto-updated `updated_at` timestamps

## After Migration

Update your `.env` file with production Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

Get these from: Supabase Dashboard → Settings → API

## Troubleshooting

### Error: "extension uuid-ossp does not exist"
- This should be auto-enabled, but if not:
- Run: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` first

### Error: "auth.users does not exist"
- Ensure you're using a Supabase project (not vanilla PostgreSQL)
- Supabase automatically creates the auth schema

### Error: "permission denied"
- Ensure you're running SQL as service_role or postgres user
- In dashboard SQL Editor, this is automatic

## Next Steps

After migration is complete:
1. ✅ Mark this todo as complete
2. Start the development server: `npm run dev`
3. Test authentication flow
4. Begin development!
