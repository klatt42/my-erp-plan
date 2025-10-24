# FIX RLS POLICY ERROR - IMMEDIATE ACTION REQUIRED

## Problem Identified ✅

**Root Cause**: The application code was trying to manually insert into `organization_members` table AFTER the database trigger already did it automatically, causing an RLS policy violation.

## Two-Part Fix

### Part 1: Application Code ✅ DONE
Fixed `app/api/orgs/route.ts` - removed duplicate membership insertion

### Part 2: Database Migration ⚠️ NEEDS YOUR ACTION

You need to apply migration `005_complete_rls_reset.sql` to your Supabase database.

## Quick Fix Steps (5 minutes)

### Step 1: Open Supabase Dashboard
```
https://supabase.com/dashboard
```
- Select your project: `my-erp-plan`

### Step 2: Go to SQL Editor
- Left sidebar → **SQL Editor**
- Click **"+ New Query"**

### Step 3: Copy Migration SQL
In WSL terminal, run:
```bash
cd /home/klatt42/projects/genesis-skills-test/my-erp-plan
cat supabase/migrations/005_complete_rls_reset.sql
```
- Select all output
- Copy to clipboard

### Step 4: Run Migration
- Paste into Supabase SQL Editor
- Click **"Run"** button (bottom right)
- Expected result: "Success. No rows returned" or similar

### Step 5: Verify Fix
Refresh your browser and try creating an organization again. The error should be gone!

---

## What Changed in the Code

### Before (BROKEN):
```typescript
// Create organization
const { data: org } = await supabase
  .from("organizations")
  .insert({ name, slug, tier: "free" })
  .select()
  .single();

// ❌ PROBLEM: Manually insert membership
const { error: memberError } = await supabase
  .from("organization_members")
  .insert({
    org_id: org.id,
    user_id: user.id,
    role: "admin",
  });
```

### After (FIXED):
```typescript
// Create organization
// The database trigger 'add_org_creator_trigger' automatically
// adds the creator as admin to organization_members table
const { data: org } = await supabase
  .from("organizations")
  .insert({ name, slug, tier: "free" })
  .select()
  .single();

// ✅ FIXED: No manual membership insertion needed!
return NextResponse.json({ organization: org }, { status: 201 });
```

---

## What the Migration Does

Migration `005_complete_rls_reset.sql`:

1. **Disables RLS temporarily** on both tables
2. **Drops ALL old policies** (clean slate)
3. **Re-enables RLS**
4. **Creates SIMPLE policies**:
   - ✅ Allow authenticated users to INSERT organizations
   - ✅ Allow users to SELECT orgs they're members of
   - ✅ Allow admins to UPDATE their orgs
   - ✅ Allow users to view their own memberships
   - ✅ Allow authenticated users to INSERT memberships
5. **Recreates trigger** `add_org_creator_trigger` with `SECURITY DEFINER`
6. **Grants permissions** to authenticated role

---

## Testing After Fix

1. **Restart Next.js dev server**:
   ```bash
   npm run dev
   ```

2. **Clear browser cache/cookies** (or use new incognito window)

3. **Try creating organization**:
   - Go to `/onboarding`
   - Fill out form
   - Submit
   - Should succeed without RLS error!

4. **Verify in Supabase**:
   - Dashboard → Table Editor → organizations
   - Should see new organization
   - Dashboard → Table Editor → organization_members
   - Should see your user as admin

---

## If Still Having Issues

### Check Auth Status
```typescript
// Add temporary logging to app/api/orgs/route.ts
const { data: { user } } = await supabase.auth.getUser();
console.log("Authenticated user:", user?.id, user?.email);
```

### Check RLS Policies Applied
In Supabase SQL Editor, run:
```sql
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('organizations', 'organization_members')
ORDER BY tablename, policyname;
```

Should see:
- `allow_authenticated_insert_org` (organizations, INSERT)
- `allow_select_member_orgs` (organizations, SELECT)
- `allow_admin_update_org` (organizations, UPDATE)
- `allow_view_own_membership` (organization_members, SELECT)
- `allow_authenticated_insert_membership` (organization_members, INSERT)

### Check Trigger Exists
In Supabase SQL Editor, run:
```sql
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'add_org_creator_trigger';
```

Should return 1 row showing the trigger on `organizations` table.

---

## Genesis Skills Used
- ✅ **genesis-supabase** - RLS policy patterns and troubleshooting

## Next Steps After Fix
1. Test organization creation ✅
2. Test organization switching ✅
3. Continue with your ERP development! 🚀
