-- Complete RLS reset - start from scratch
-- This will completely disable and rebuild all RLS policies

-- ====================================
-- STEP 1: Disable RLS on both tables
-- ====================================
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- ====================================
-- STEP 2: Drop ALL existing policies
-- ====================================

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can delete their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "create_organizations" ON organizations;
DROP POLICY IF EXISTS "authenticated_users_can_create_orgs" ON organizations;
DROP POLICY IF EXISTS "view_organizations" ON organizations;
DROP POLICY IF EXISTS "users_view_their_orgs" ON organizations;
DROP POLICY IF EXISTS "update_organizations" ON organizations;
DROP POLICY IF EXISTS "admins_update_their_orgs" ON organizations;
DROP POLICY IF EXISTS "admins_delete_their_orgs" ON organizations;

-- Organization members policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can invite members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Admins can remove members" ON organization_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "Allow first member creation" ON organization_members;
DROP POLICY IF EXISTS "view_own_memberships" ON organization_members;
DROP POLICY IF EXISTS "authenticated_can_insert_memberships" ON organization_members;
DROP POLICY IF EXISTS "update_own_membership" ON organization_members;

-- ====================================
-- STEP 3: Re-enable RLS
-- ====================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- ====================================
-- STEP 4: Create SIMPLE policies
-- ====================================

-- ORGANIZATIONS: Allow all authenticated users to insert (trigger will handle membership)
CREATE POLICY "allow_authenticated_insert_org"
ON organizations
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ORGANIZATIONS: Allow users to select orgs they're members of
CREATE POLICY "allow_select_member_orgs"
ON organizations
FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT org_id
        FROM organization_members
        WHERE user_id = auth.uid()
    )
);

-- ORGANIZATIONS: Allow admins to update
CREATE POLICY "allow_admin_update_org"
ON organizations
FOR UPDATE
TO authenticated
USING (
    id IN (
        SELECT org_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    id IN (
        SELECT org_id
        FROM organization_members
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- ORGANIZATION_MEMBERS: Allow users to see their own memberships
CREATE POLICY "allow_view_own_membership"
ON organization_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- ORGANIZATION_MEMBERS: Allow authenticated users to insert (for org creation)
CREATE POLICY "allow_authenticated_insert_membership"
ON organization_members
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ====================================
-- STEP 5: Ensure trigger works
-- ====================================
CREATE OR REPLACE FUNCTION add_org_creator_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Use INSERT with explicit schema
    INSERT INTO public.organization_members (org_id, user_id, role, invited_by)
    VALUES (NEW.id, auth.uid(), 'admin', auth.uid());

    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;

CREATE TRIGGER add_org_creator_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_org_creator_as_admin();

-- ====================================
-- STEP 6: Grant necessary permissions
-- ====================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON organizations TO authenticated;
GRANT ALL ON organization_members TO authenticated;

-- ====================================
-- Verification query (run after migration)
-- ====================================
-- SELECT
--     schemaname,
--     tablename,
--     policyname,
--     permissive,
--     roles,
--     cmd,
--     qual,
--     with_check
-- FROM pg_policies
-- WHERE tablename IN ('organizations', 'organization_members')
-- ORDER BY tablename, policyname;
