-- Fix circular reference in organization_members RLS policies
-- The issue: Policies check organization_members to verify access to organization_members

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Admins can invite members" ON organization_members;
DROP POLICY IF EXISTS "Admins can update member roles" ON organization_members;
DROP POLICY IF EXISTS "Admins can remove members" ON organization_members;

-- Recreate policies without circular references
-- Allow users to see their own membership records
CREATE POLICY "Users can view their own memberships"
    ON organization_members FOR SELECT
    USING (user_id = auth.uid());

-- Allow users to see other members in organizations where they are members
-- Use a lateral join to avoid recursion
CREATE POLICY "Users can view org members"
    ON organization_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.org_id = organization_members.org_id
        )
    );

-- Allow admins to invite members (check admin status via direct query)
CREATE POLICY "Admins can invite members"
    ON organization_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.org_id = organization_members.org_id
            AND om.role = 'admin'
        )
    );

-- Special case: Allow first member to be created (for organization creation)
CREATE POLICY "Allow first member creation"
    ON organization_members FOR INSERT
    WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.org_id = organization_members.org_id
        )
        AND user_id = auth.uid()
    );

-- Allow admins to update member roles
CREATE POLICY "Admins can update member roles"
    ON organization_members FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.org_id = organization_members.org_id
            AND om.role = 'admin'
        )
    );

-- Allow admins to remove members
CREATE POLICY "Admins can remove members"
    ON organization_members FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.user_id = auth.uid()
            AND om.org_id = organization_members.org_id
            AND om.role = 'admin'
        )
    );

-- Also fix the organizations INSERT policy to ensure creator becomes admin
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;

CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add a function to automatically add creator as admin
CREATE OR REPLACE FUNCTION add_org_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert the creator as admin of the new organization
    INSERT INTO organization_members (org_id, user_id, role, invited_by)
    VALUES (NEW.id, auth.uid(), 'admin', auth.uid());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-add creator as admin
DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;

CREATE TRIGGER add_org_creator_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_org_creator_as_admin();
