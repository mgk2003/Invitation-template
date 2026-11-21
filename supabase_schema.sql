-- ============================================================
-- Supabase Schema for Wedding Invitation Generator CMS
-- (With Super Admin & Admin Hierarchy)
-- ============================================================

-- 1. Create Status Enum
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('Draft', 'Active', 'Inactive', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Profiles Table (Super Admin vs Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin')),
    name TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 3. Create Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    status invitation_status NOT NULL DEFAULT 'Draft',
    "backgroundImage" TEXT NOT NULL DEFAULT 'background_1',
    "adminId" UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    couple JSONB NOT NULL DEFAULT '{}'::jsonb,
    dates JSONB NOT NULL DEFAULT '{}'::jsonb,
    hero JSONB DEFAULT '{}'::jsonb,
    events JSONB DEFAULT '[]'::jsonb,
    "meetSection" JSONB DEFAULT '{}'::jsonb,
    "thingsToKnow" JSONB DEFAULT '{}'::jsonb,
    rsvp JSONB DEFAULT '{}'::jsonb,
    audio JSONB DEFAULT '{}'::jsonb,
    views INTEGER DEFAULT 0,
    "viewLogs" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was previously created
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS "adminId" UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS "backgroundImage" TEXT NOT NULL DEFAULT 'background_1';

-- 4. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations (slug);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations (status);
CREATE INDEX IF NOT EXISTS idx_invitations_admin_id ON public.invitations ("adminId");
CREATE INDEX IF NOT EXISTS idx_invitations_wedding_datetime ON public.invitations ((dates->>'weddingDatetime'));

-- 5. Automatically update "updatedAt" column on change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invitations_updated_at ON public.invitations;
CREATE TRIGGER set_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Auto-Create Profile on Auth Signup Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role TEXT := 'admin';
    v_count INT;
BEGIN
    -- If this is the very first user in the database, automatically make them super_admin!
    SELECT COUNT(*) INTO v_count FROM public.profiles;
    IF v_count = 0 THEN
        v_role := 'super_admin';
    ELSE
        IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
            v_role := NEW.raw_user_meta_data->>'role';
        END IF;
    END IF;

    INSERT INTO public.profiles (id, email, role, name)
    VALUES (
        NEW.id,
        LOWER(TRIM(NEW.email)),
        v_role,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill any existing user in auth.users into profiles as super_admin
INSERT INTO public.profiles (id, email, role, name)
SELECT 
    id, 
    LOWER(TRIM(email)), 
    'super_admin', 
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';

-- 7. Auto-Complete Expired Wedding Invitations Function
CREATE OR REPLACE FUNCTION check_and_complete_expired_invitations()
RETURNS INT AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE public.invitations
    SET status = 'Completed'
    WHERE status IN ('Active', 'Inactive')
      AND dates->>'weddingDatetime' IS NOT NULL
      AND (dates->>'weddingDatetime')::timestamptz < NOW();
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Increment View Count RPC Function
CREATE OR REPLACE FUNCTION increment_invitation_views(p_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.invitations
    SET views = COALESCE(views, 0) + 1
    WHERE slug = LOWER(TRIM(p_slug));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Slug Availability Check RPC Function
CREATE OR REPLACE FUNCTION check_slug_availability(p_slug TEXT, p_exclude_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.invitations
        WHERE slug = LOWER(TRIM(p_slug))
          AND (p_exclude_id IS NULL OR id != p_exclude_id)
    ) INTO v_exists;
    RETURN NOT v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC Function: Get Current User Profile (Role & Name)
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS JSONB AS $$
DECLARE
    v_profile JSONB;
BEGIN
    SELECT row_to_json(p)
    INTO v_profile
    FROM public.profiles p
    WHERE p.id = auth.uid();

    RETURN v_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. RPC Function: List All Admins (For Super Admin Dashboard & Assignment Dropdown)
CREATE OR REPLACE FUNCTION get_all_admins()
RETURNS JSONB AS $$
DECLARE
    v_admins JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(row_to_json(a)), '[]'::jsonb)
    INTO v_admins
    FROM (
        SELECT 
            p.id,
            p.email,
            p.role,
            p.name,
            p."createdAt",
            COUNT(i.id)::int AS "invitationCount"
        FROM public.profiles p
        LEFT JOIN public.invitations i ON i."adminId" = p.id
        GROUP BY p.id, p.email, p.role, p.name, p."createdAt"
        ORDER BY p."createdAt" ASC
    ) a;

    RETURN v_admins;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RPC Function: Create New Admin User (Callable by Super Admin)
CREATE OR REPLACE FUNCTION create_new_admin_user(
    p_email TEXT,
    p_password TEXT,
    p_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'admin'
)
RETURNS JSONB AS $$
DECLARE
    v_caller_role TEXT;
    v_new_user_id UUID := gen_random_uuid();
    v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
    -- Verify the caller is a super_admin
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();

    IF v_caller_role != 'super_admin' THEN
        RAISE EXCEPTION 'Access denied. Only Super Admin can create admin accounts.';
    END IF;

    -- Check if email already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = v_clean_email) THEN
        RAISE EXCEPTION 'An account with email % already exists.', v_clean_email;
    END IF;

    -- Insert into auth.users with encrypted password
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        v_new_user_id,
        'authenticated',
        'authenticated',
        v_clean_email,
        crypt(p_password, gen_salt('bf')),
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('name', p_name, 'role', p_role),
        NOW(),
        NOW()
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (v_new_user_id, v_clean_email, p_role, COALESCE(p_name, split_part(v_clean_email, '@', 1)))
    ON CONFLICT (id) DO UPDATE SET role = p_role, name = COALESCE(p_name, profiles.name);

    RETURN jsonb_build_object(
        'id', v_new_user_id,
        'email', v_clean_email,
        'role', p_role,
        'name', p_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Get Invitations With Search, Filter, Pagination & Scoped Status Counts
CREATE OR REPLACE FUNCTION get_invitations_with_counts(
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_start_date TEXT DEFAULT NULL,
    p_end_date TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'createdAt',
    p_sort_order TEXT DEFAULT 'desc',
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 10,
    p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_caller_role TEXT;
    v_caller_id UUID := auth.uid();
    v_total INT;
    v_draft INT;
    v_active INT;
    v_inactive INT;
    v_completed INT;
    v_filtered_total INT;
    v_items JSONB;
BEGIN
    -- Refresh completed events
    PERFORM check_and_complete_expired_invitations();

    -- Determine caller role
    SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = v_caller_id;

    -- Overall Counts (scoped by admin if not super_admin)
    SELECT COUNT(*) INTO v_total 
    FROM public.invitations
    WHERE (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id);

    SELECT COUNT(*) INTO v_draft 
    FROM public.invitations 
    WHERE status = 'Draft'
      AND (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id);

    SELECT COUNT(*) INTO v_active 
    FROM public.invitations 
    WHERE status = 'Active'
      AND (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id);

    SELECT COUNT(*) INTO v_inactive 
    FROM public.invitations 
    WHERE status = 'Inactive'
      AND (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id);

    SELECT COUNT(*) INTO v_completed 
    FROM public.invitations 
    WHERE status = 'Completed'
      AND (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id);

    -- Filtered total count
    SELECT COUNT(*) INTO v_filtered_total
    FROM public.invitations
    WHERE (v_caller_role = 'super_admin' OR "adminId" = v_caller_id OR "adminId" IS NULL)
      AND (p_admin_id IS NULL OR "adminId" = p_admin_id)
      AND (p_status IS NULL OR status = p_status::invitation_status)
      AND (p_search IS NULL OR p_search = '' OR 
           slug ILIKE '%' || p_search || '%' OR 
           couple->>'brideName' ILIKE '%' || p_search || '%' OR 
           couple->>'groomName' ILIKE '%' || p_search || '%')
      AND (p_start_date IS NULL OR dates->>'weddingDatetime' >= p_start_date)
      AND (p_end_date IS NULL OR dates->>'weddingDatetime' <= p_end_date);

    -- Paginated Items with admin owner info attached
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_items
    FROM (
        SELECT 
            i.*,
            p.email AS "adminEmail",
            p.name AS "adminName"
        FROM public.invitations i
        LEFT JOIN public.profiles p ON p.id = i."adminId"
        WHERE (v_caller_role = 'super_admin' OR i."adminId" = v_caller_id OR i."adminId" IS NULL)
          AND (p_admin_id IS NULL OR i."adminId" = p_admin_id)
          AND (p_status IS NULL OR i.status = p_status::invitation_status)
          AND (p_search IS NULL OR p_search = '' OR 
               i.slug ILIKE '%' || p_search || '%' OR 
               i.couple->>'brideName' ILIKE '%' || p_search || '%' OR 
               i.couple->>'groomName' ILIKE '%' || p_search || '%')
          AND (p_start_date IS NULL OR i.dates->>'weddingDatetime' >= p_start_date)
          AND (p_end_date IS NULL OR i.dates->>'weddingDatetime' <= p_end_date)
        ORDER BY 
            CASE WHEN p_sort_by = 'weddingDate' AND p_sort_order = 'asc' THEN i.dates->>'weddingDatetime' END ASC NULLS LAST,
            CASE WHEN p_sort_by = 'weddingDate' AND p_sort_order = 'desc' THEN i.dates->>'weddingDatetime' END DESC NULLS LAST,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'createdAt') AND p_sort_order = 'asc' THEN i."createdAt" END ASC,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'createdAt') AND (p_sort_order IS NULL OR p_sort_order = 'desc') THEN i."createdAt" END DESC
        LIMIT p_limit
        OFFSET (p_page - 1) * p_limit
    ) t;

    RETURN jsonb_build_object(
        'items', v_items,
        'meta', jsonb_build_object(
            'total', v_filtered_total,
            'page', p_page,
            'limit', p_limit,
            'totalPages', CEIL(v_filtered_total::float / GREATEST(p_limit, 1))
        ),
        'counts', jsonb_build_object(
            'total', v_total,
            'draft', v_draft,
            'active', v_active,
            'inactive', v_inactive,
            'completed', v_completed
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Row Level Security (RLS)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active or completed invitations" ON public.invitations;
DROP POLICY IF EXISTS "Authenticated users have full access" ON public.invitations;
DROP POLICY IF EXISTS "Admins access own and super admin access all" ON public.invitations;

-- Policy A: Public users can read only published invitations
CREATE POLICY "Public can view active or completed invitations"
ON public.invitations
FOR SELECT
TO anon, authenticated
USING (status IN ('Active', 'Completed'));

-- Policy B: Super Admin can access all; Admin can only access their own
CREATE POLICY "Admins access own and super admin access all"
ON public.invitations
FOR ALL
TO authenticated
USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    OR "adminId" = auth.uid()
    OR "adminId" IS NULL
)
WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    OR "adminId" = auth.uid()
    OR "adminId" IS NULL
);

-- Profiles RLS
DROP POLICY IF EXISTS "Users can read own profile or super admin read all" ON public.profiles;
CREATE POLICY "Users can read own profile or super admin read all"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 15. Storage Bucket Setup (Fail-safe wrapper)
DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('invitation-media', 'invitation-media', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    DROP POLICY IF EXISTS "Public can view invitation media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated admins can upload invitation media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated admins can update invitation media" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated admins can delete invitation media" ON storage.objects;

    CREATE POLICY "Public can view invitation media"
    ON storage.objects FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'invitation-media');

    CREATE POLICY "Authenticated admins can upload invitation media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'invitation-media');

    CREATE POLICY "Authenticated admins can update invitation media"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'invitation-media');

    CREATE POLICY "Authenticated admins can delete invitation media"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'invitation-media');
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- 16. Seed Default Super Admin Account (superadmin@gmail.com / 12345678)
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'superadmin@gmail.com';

    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            'superadmin@gmail.com',
            crypt('12345678', gen_salt('bf')),
            NOW(),
            jsonb_build_object('provider', 'email', 'providers', array['email']),
            jsonb_build_object('name', 'Super Admin', 'role', 'super_admin'),
            NOW(),
            NOW()
        );
    ELSE
        UPDATE auth.users
        SET encrypted_password = crypt('12345678', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = v_user_id;
    END IF;

    -- Ensure profile exists with role 'super_admin'
    INSERT INTO public.profiles (id, email, role, name)
    VALUES (v_user_id, 'superadmin@gmail.com', 'super_admin', 'Super Admin')
    ON CONFLICT (id) DO UPDATE SET role = 'super_admin', name = 'Super Admin';
END $$;
