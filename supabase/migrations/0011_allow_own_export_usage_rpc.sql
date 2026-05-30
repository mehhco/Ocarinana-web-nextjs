-- Reuse the existing export usage RPC for authenticated users.
-- The function keeps service-role compatibility while preventing ordinary
-- users from incrementing another users usage row.

CREATE OR REPLACE FUNCTION public.increment_user_daily_export_usage(
  p_user_id UUID,
  p_usage_date DATE,
  p_limit INTEGER
) RETURNS TABLE (
  allowed BOOLEAN,
  used_count INTEGER,
  remaining_count INTEGER
) AS $$
DECLARE
  v_count INTEGER;
  v_auth_uid UUID;
  v_auth_role TEXT;
BEGIN
  v_auth_uid := auth.uid();
  v_auth_role := auth.role();

  IF p_limit < 1 THEN
    RAISE EXCEPTION 'Export limit must be positive'
      USING ERRCODE = '22023';
  END IF;

  IF v_auth_role <> 'service_role' AND (v_auth_uid IS NULL OR v_auth_uid <> p_user_id) THEN
    RAISE EXCEPTION 'Users can only increment their own export usage'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_daily_usage (user_id, usage_date, export_count)
  VALUES (p_user_id, p_usage_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT export_count
  INTO v_count
  FROM public.user_daily_usage
  WHERE user_id = p_user_id
    AND usage_date = p_usage_date
  FOR UPDATE;

  IF v_count >= p_limit THEN
    allowed := false;
    used_count := v_count;
    remaining_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  v_count := v_count + 1;

  UPDATE public.user_daily_usage
  SET export_count = v_count
  WHERE user_id = p_user_id
    AND usage_date = p_usage_date;

  allowed := true;
  used_count := v_count;
  remaining_count := GREATEST(p_limit - v_count, 0);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER) TO service_role;

NOTIFY pgrst, 'reload schema';

COMMENT ON FUNCTION public.increment_user_daily_export_usage(UUID, DATE, INTEGER)
  IS 'Atomically increments daily export usage. Authenticated users may only increment their own row; service role remains allowed for server-side maintenance.';

