-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ORGANIZATIONS TABLE
-- =====================================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    settings JSONB DEFAULT '{}'::jsonb,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_tier ON organizations(tier);

-- =====================================================
-- ORGANIZATION MEMBERS TABLE
-- =====================================================
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);

-- =====================================================
-- EMERGENCY PLANS TABLE
-- =====================================================
CREATE TABLE emergency_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'active', 'archived')),
    content_json JSONB DEFAULT '{}'::jsonb,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_plans_org_id ON emergency_plans(org_id);
CREATE INDEX idx_emergency_plans_status ON emergency_plans(status);
CREATE INDEX idx_emergency_plans_created_at ON emergency_plans(created_at DESC);

-- =====================================================
-- PLAN SECTIONS TABLE
-- =====================================================
CREATE TABLE plan_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID NOT NULL REFERENCES emergency_plans(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL,
    content TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_plan_sections_plan_id ON plan_sections(plan_id);
CREATE INDEX idx_plan_sections_order ON plan_sections(plan_id, "order");

-- =====================================================
-- RESOURCES TABLE
-- =====================================================
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('personnel', 'equipment', 'facility', 'contact')),
    name TEXT NOT NULL,
    details_json JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_resources_org_id ON resources(org_id);
CREATE INDEX idx_resources_type ON resources(org_id, resource_type);

-- =====================================================
-- EMERGENCY CONTACTS TABLE
-- =====================================================
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    priority INTEGER NOT NULL DEFAULT 1 CHECK (priority >= 1 AND priority <= 10)
);

CREATE INDEX idx_emergency_contacts_org_id ON emergency_contacts(org_id);
CREATE INDEX idx_emergency_contacts_priority ON emergency_contacts(org_id, priority);

-- =====================================================
-- INCIDENTS TABLE
-- =====================================================
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES emergency_plans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_incidents_org_id ON incidents(org_id);
CREATE INDEX idx_incidents_status ON incidents(org_id, status);
CREATE INDEX idx_incidents_activated_at ON incidents(activated_at DESC);

-- =====================================================
-- INCIDENT UPDATES TABLE
-- =====================================================
CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    update_type TEXT NOT NULL CHECK (update_type IN ('status', 'action', 'resource', 'photo', 'note')),
    content TEXT NOT NULL,
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_incident_updates_incident_id ON incident_updates(incident_id);
CREATE INDEX idx_incident_updates_created_at ON incident_updates(incident_id, created_at DESC);

-- =====================================================
-- AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(org_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(org_id, timestamp DESC);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    UNIQUE(org_id)
);

CREATE INDEX idx_subscriptions_org_id ON subscriptions(org_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_plans_updated_at BEFORE UPDATE ON emergency_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view their organizations"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their organizations"
    ON organizations FOR UPDATE
    USING (
        id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their organizations"
    ON organizations FOR DELETE
    USING (
        id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create organizations"
    ON organizations FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- ORGANIZATION MEMBERS POLICIES
-- =====================================================
CREATE POLICY "Users can view members of their organizations"
    ON organization_members FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can invite members"
    ON organization_members FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update member roles"
    ON organization_members FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can remove members"
    ON organization_members FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- EMERGENCY PLANS POLICIES
-- =====================================================
CREATE POLICY "Users can view plans in their organizations"
    ON emergency_plans FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Editors and admins can create plans"
    ON emergency_plans FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors and admins can update plans"
    ON emergency_plans FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete plans"
    ON emergency_plans FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- PLAN SECTIONS POLICIES
-- =====================================================
CREATE POLICY "Users can view sections of plans in their organizations"
    ON plan_sections FOR SELECT
    USING (
        plan_id IN (
            SELECT id FROM emergency_plans
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Editors and admins can create sections"
    ON plan_sections FOR INSERT
    WITH CHECK (
        plan_id IN (
            SELECT id FROM emergency_plans
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
            )
        )
    );

CREATE POLICY "Editors and admins can update sections"
    ON plan_sections FOR UPDATE
    USING (
        plan_id IN (
            SELECT id FROM emergency_plans
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
            )
        )
    );

CREATE POLICY "Admins can delete sections"
    ON plan_sections FOR DELETE
    USING (
        plan_id IN (
            SELECT id FROM emergency_plans
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- =====================================================
-- RESOURCES POLICIES
-- =====================================================
CREATE POLICY "Users can view resources in their organizations"
    ON resources FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Editors and admins can create resources"
    ON resources FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors and admins can update resources"
    ON resources FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete resources"
    ON resources FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- EMERGENCY CONTACTS POLICIES
-- =====================================================
CREATE POLICY "Users can view contacts in their organizations"
    ON emergency_contacts FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Editors and admins can create contacts"
    ON emergency_contacts FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors and admins can update contacts"
    ON emergency_contacts FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete contacts"
    ON emergency_contacts FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- INCIDENTS POLICIES
-- =====================================================
CREATE POLICY "Users can view incidents in their organizations"
    ON incidents FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Editors and admins can create incidents"
    ON incidents FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Editors and admins can update incidents"
    ON incidents FOR UPDATE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
        )
    );

CREATE POLICY "Admins can delete incidents"
    ON incidents FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- INCIDENT UPDATES POLICIES
-- =====================================================
CREATE POLICY "Users can view incident updates in their organizations"
    ON incident_updates FOR SELECT
    USING (
        incident_id IN (
            SELECT id FROM incidents
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create incident updates"
    ON incident_updates FOR INSERT
    WITH CHECK (
        incident_id IN (
            SELECT id FROM incidents
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own incident updates"
    ON incident_updates FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can delete incident updates"
    ON incident_updates FOR DELETE
    USING (
        incident_id IN (
            SELECT id FROM incidents
            WHERE org_id IN (
                SELECT org_id FROM organization_members
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
    );

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================
CREATE POLICY "Admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can create audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- SUBSCRIPTIONS POLICIES
-- =====================================================
CREATE POLICY "Admins can view subscriptions"
    ON subscriptions FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM organization_members
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can manage subscriptions"
    ON subscriptions FOR ALL
    WITH CHECK (true);
