# RLS Fix Summary - Migration 006

## The Problem

**Error**: "infinite recursion detected in policy for relation organization_members"

**Root Cause**: Database trigger attempting to use `auth.uid()` in a context where it returns `null` (service role operations).

## The Original Trigger (Removed)

```sql
CREATE OR REPLACE FUNCTION add_org_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.organization_members (org_id, user_id, role, invited_by)
    VALUES (NEW.id, auth.uid(), 'admin', auth.uid());
    RETURN NEW;
END;
$$;

CREATE TRIGGER add_org_creator_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_org_creator_as_admin();
```

## Why It Failed

1. **API route uses service role client** to bypass RLS (necessary for org creation)
2. **Service role context**: `auth.uid()` returns `NULL` (no user context)
3. **Trigger tries to insert**: `user_id = NULL` → violates NOT NULL constraint
4. **Alternative approach**: Trigger relied on auth context that doesn't exist with service role

## Migration 006 - The Fix

```sql
-- Remove the trigger that's causing issues
-- The API route now handles adding the creator as admin explicitly

DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;
DROP FUNCTION IF EXISTS add_org_creator_as_admin();
```

## The New Pattern (API Route)

**File**: `app/api/orgs/route.ts`

```typescript
export async function POST(request: Request) {
  // Step 1: Authenticate user with regular client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Step 2: Use service role to create organization (bypasses RLS)
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: org, error: orgError } = await supabaseAdmin
    .from("organizations")
    .insert({ name: data.name, slug, tier: "free", settings: {...} })
    .select()
    .single();

  // Step 3: Explicitly add user as admin (service role + explicit user.id)
  const { error: memberError } = await supabaseAdmin
    .from("organization_members")
    .insert({
      org_id: org.id,
      user_id: user.id,  // ← Use authenticated user's ID explicitly
      role: "admin",
      invited_by: user.id,
    });

  if (memberError) {
    // Cleanup if membership creation fails
    await supabaseAdmin.from("organizations").delete().eq("id", org.id);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ organization: org }, { status: 201 });
}
```

## Key Principles Established

### ✅ DO: Service Role in API Routes
- API routes can use service role to bypass RLS for administrative operations
- Authenticate user first with regular client
- Pass authenticated `user.id` explicitly to service role operations

### ❌ DON'T: Database Triggers with Service Role
- Triggers can't access `auth.uid()` when service role creates records
- Triggers assume user context that doesn't exist in admin operations
- Better to handle membership creation explicitly in API route

### Architecture Pattern

```
Frontend (Onboarding Page)
    ↓ fetch('/api/orgs', {...})
API Route
    ↓ Regular Supabase Client → Get authenticated user
    ↓ Service Role Client → Create org (bypass RLS)
    ↓ Service Role Client → Create membership with explicit user.id
    ↓ Success/Error response
Frontend
    ↓ Redirect to dashboard
```

## Why This Works

1. **User Authentication**: Regular client verifies user is logged in
2. **Service Role Privilege**: Admin client bypasses RLS to create org
3. **Explicit User ID**: Pass `user.id` from authenticated session (not `auth.uid()`)
4. **Transaction Safety**: Cleanup org if membership fails
5. **No Trigger Dependency**: All logic in API route (explicit, debuggable)

## Genesis Skills Connection

This pattern aligns with **genesis-saas-app** Pattern 1 (Multi-Tenant Database) but extends it for administrative operations:

- Regular RLS policies for normal user operations
- Service role pattern for admin operations (org creation)
- Explicit user ID passing instead of relying on `auth.uid()`

## Lessons Learned

1. **Service role != User context**: Service role operations don't have `auth.uid()`
2. **Triggers are implicit**: Hard to debug, better to make operations explicit
3. **API routes for admin ops**: Use service role in API, not client-side
4. **Pass user ID explicitly**: Don't rely on database context functions
5. **Cleanup on failure**: Transaction-like patterns prevent orphaned records

## Testing Verification

✅ **Tested Successfully**:
- User signup → Email verification → Login
- Organization creation form submission
- Automatic admin membership creation
- Dashboard access with organization data
- Organization switching in UI

## Future Reference

When adding similar administrative operations:
1. Authenticate user with regular client
2. Use service role for the admin operation
3. Pass `user.id` explicitly from authenticated session
4. Handle cleanup if dependent operations fail
5. Avoid database triggers that rely on `auth.uid()`

---

**Migration Applied**: October 24, 2025
**Status**: ✅ Verified working in production
**Result**: Authentication and organization creation fully functional
