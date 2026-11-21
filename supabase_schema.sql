-- ============================================================
-- Supabase Schema for Wedding Invitation Generator CMS
-- ============================================================

-- 1. Create Status Enum
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('Draft', 'Active', 'Inactive', 'Completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Invitations Table
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    status invitation_status NOT NULL DEFAULT 'Draft',
    "backgroundImage" TEXT NOT NULL DEFAULT 'background_1',
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

-- 3. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_invitations_slug ON public.invitations (slug);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations (status);
CREATE INDEX IF NOT EXISTS idx_invitations_wedding_datetime ON public.invitations ((dates->>'weddingDatetime'));

-- 4. Automatically update "updatedAt" column on change
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

-- 5. Auto-Complete Expired Wedding Invitations Function
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

-- 6. Increment View Count RPC Function
CREATE OR REPLACE FUNCTION increment_invitation_views(p_slug TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.invitations
    SET views = COALESCE(views, 0) + 1
    WHERE slug = LOWER(TRIM(p_slug));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Slug Availability Check RPC Function
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

-- 8. Get Invitations With Search, Filter, Pagination & Status Counts
CREATE OR REPLACE FUNCTION get_invitations_with_counts(
    p_status TEXT DEFAULT NULL,
    p_search TEXT DEFAULT NULL,
    p_start_date TEXT DEFAULT NULL,
    p_end_date TEXT DEFAULT NULL,
    p_sort_by TEXT DEFAULT 'createdAt',
    p_sort_order TEXT DEFAULT 'desc',
    p_page INT DEFAULT 1,
    p_limit INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
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

    -- Overall Counts for CMS tabs / badges
    SELECT COUNT(*) INTO v_total FROM public.invitations;
    SELECT COUNT(*) INTO v_draft FROM public.invitations WHERE status = 'Draft';
    SELECT COUNT(*) INTO v_active FROM public.invitations WHERE status = 'Active';
    SELECT COUNT(*) INTO v_inactive FROM public.invitations WHERE status = 'Inactive';
    SELECT COUNT(*) INTO v_completed FROM public.invitations WHERE status = 'Completed';

    -- Filtered total count
    SELECT COUNT(*) INTO v_filtered_total
    FROM public.invitations
    WHERE (p_status IS NULL OR status = p_status::invitation_status)
      AND (p_search IS NULL OR p_search = '' OR 
           slug ILIKE '%' || p_search || '%' OR 
           couple->>'brideName' ILIKE '%' || p_search || '%' OR 
           couple->>'groomName' ILIKE '%' || p_search || '%')
      AND (p_start_date IS NULL OR dates->>'weddingDatetime' >= p_start_date)
      AND (p_end_date IS NULL OR dates->>'weddingDatetime' <= p_end_date);

    -- Paginated Items
    SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
    INTO v_items
    FROM (
        SELECT * FROM public.invitations
        WHERE (p_status IS NULL OR status = p_status::invitation_status)
          AND (p_search IS NULL OR p_search = '' OR 
               slug ILIKE '%' || p_search || '%' OR 
               couple->>'brideName' ILIKE '%' || p_search || '%' OR 
               couple->>'groomName' ILIKE '%' || p_search || '%')
          AND (p_start_date IS NULL OR dates->>'weddingDatetime' >= p_start_date)
          AND (p_end_date IS NULL OR dates->>'weddingDatetime' <= p_end_date)
        ORDER BY 
            CASE WHEN p_sort_by = 'weddingDate' AND p_sort_order = 'asc' THEN dates->>'weddingDatetime' END ASC NULLS LAST,
            CASE WHEN p_sort_by = 'weddingDate' AND p_sort_order = 'desc' THEN dates->>'weddingDatetime' END DESC NULLS LAST,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'createdAt') AND p_sort_order = 'asc' THEN "createdAt" END ASC,
            CASE WHEN (p_sort_by IS NULL OR p_sort_by = 'createdAt') AND (p_sort_order IS NULL OR p_sort_order = 'desc') THEN "createdAt" END DESC
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

-- 9. Row Level Security (RLS)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Public can view active or completed invitations" ON public.invitations;
DROP POLICY IF EXISTS "Authenticated users have full access" ON public.invitations;
DROP POLICY IF EXISTS "Anon can check slug" ON public.invitations;

-- Policy A: Public users can read only published (Active or Completed) invitations
CREATE POLICY "Public can view active or completed invitations"
ON public.invitations
FOR SELECT
TO anon, authenticated
USING (status IN ('Active', 'Completed'));

-- Policy B: Authenticated admin users have full CRUD access
CREATE POLICY "Authenticated users have full access"
ON public.invitations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 10. Storage Bucket Setup (Fail-safe wrapper)
DO $$ BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('invitation-media', 'invitation-media', true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- Storage RLS Policies (Fail-safe wrapper)
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
