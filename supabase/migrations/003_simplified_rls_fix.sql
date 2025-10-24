-- Completely remove and rebuild organization_members policies without ANY recursion
-- This is the root cause: policies checking organization_members while querying organization_members

-- Disable RLS temporarily to clean up
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can invite members" ON organization_members;
DROP POLICY IF EXISTS "Allow first member creation" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Admins can remove members" ON organization_members;

-- Re-enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- SIMPLE POLICY 1: Users can view their OWN membership records (no recursion)
CREATE POLICY "view_own_memberships"
    ON organization_members FOR SELECT
    USING (user_id = auth.uid());

-- SIMPLE POLICY 2: Allow INSERT for authenticated users (trigger will handle admin assignment)
CREATE POLICY "authenticated_can_insert_memberships"
    ON organization_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- SIMPLE POLICY 3: Users can update their own profile info (like notification settings)
CREATE POLICY "update_own_membership"
    ON organization_members FOR UPDATE
    USING (user_id = auth.uid());

-- SIMPLE POLICY 4: Allow DELETE only by service role (will be replaced with proper logic later)
-- For now, admins can delete via service role in API routes

-- Fix organizations policies too
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

-- Organizations: View based on direct user_id check (no join to organization_members)
CREATE POLICY "view_organizations"
    ON organizations FOR SELECT
    USING (
        -- Check if user is a member by looking at organization_members
        -- But use a subquery that doesn't trigger recursion
        id IN (
            SELECT org_id
            FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "create_organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "update_organizations"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT org_id
            FROM organization_members
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Ensure the trigger function exists and works correctly
CREATE OR REPLACE FUNCTION add_org_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the creator as admin of the new organization
    -- This bypasses RLS because function is SECURITY DEFINER
    INSERT INTO public.organization_members (org_id, user_id, role, invited_by)
    VALUES (NEW.id, auth.uid(), 'admin', auth.uid());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;
CREATE TRIGGER add_org_creator_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_org_creator_as_admin();
