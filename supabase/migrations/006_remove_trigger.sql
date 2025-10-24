-- Remove the trigger that's causing issues
-- The API route now handles adding the creator as admin explicitly

DROP TRIGGER IF EXISTS add_org_creator_trigger ON organizations;
DROP FUNCTION IF EXISTS add_org_creator_as_admin();
