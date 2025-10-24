-- Fix organization INSERT policy - the WITH CHECK clause is blocking inserts
-- The issue: We're checking if user is in organization_members, but that record doesn't exist yet!

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "create_organizations" ON organizations;

-- Create a simple INSERT policy that just checks authentication
-- The trigger will handle adding the user as admin AFTER insert
CREATE POLICY "authenticated_users_can_create_orgs"
    ON organizations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Also ensure the trigger is set up correctly with proper permissions
CREATE OR REPLACE FUNCTION add_org_creator_as_admin()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert the creator as admin
    -- SECURITY DEFINER means this runs with elevated permissions, bypassing RLS
    INSERT INTO organization_members (org_id, user_id, role, invited_by)
    VALUES (NEW.id, auth.uid(), 'admin', auth.uid());

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Error adding org creator as admin: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger is properly attached
DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;
CREATE TRIGGER add_org_creator_trigger
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION add_org_creator_as_admin();

-- Verify the SELECT policy allows users to see orgs they're members of
DROP POLICY IF EXISTS "view_organizations" ON organizations;

CREATE POLICY "users_view_their_orgs"
    ON organizations FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Allow admins to UPDATE their organizations
DROP POLICY IF EXISTS "update_organizations" ON organizations;

CREATE POLICY "admins_update_their_orgs"
    ON organizations FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
        )
    );

-- Allow admins to DELETE their organizations
DROP POLICY IF EXISTS "admins_delete_their_orgs" ON organizations;

CREATE POLICY "admins_delete_their_orgs"
    ON organizations FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM organization_members
            WHERE organization_members.org_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'admin'
        )
    );
