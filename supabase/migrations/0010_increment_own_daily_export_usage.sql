-- Allow authenticated users to atomically reserve their own daily export quota
-- without requiring the application server to use the service role key.

CREATE OR REPLACE FUNCTION public.increment_own_daily_export_usage(
  p_usage_date DATE,
  p_limit INTEGER
) RETURNS TABLE (
  allowed BOOLEAN,
  used_count INTEGER,
  remaining_count INTEGER
) AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = '28000';
  END IF;

  IF p_limit < 1 THEN
    RAISE EXCEPTION 'Export limit must be positive'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_daily_usage (user_id, usage_date, export_count)
  VALUES (v_user_id, p_usage_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT export_count
  INTO v_count
  FROM public.user_daily_usage
  WHERE user_id = v_user_id
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
  WHERE user_id = v_user_id
    AND usage_date = p_usage_date;

  allowed := true;
  used_count := v_count;
  remaining_count := GREATEST(p_limit - v_count, 0);
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.increment_own_daily_export_usage(DATE, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_own_daily_export_usage(DATE, INTEGER) TO authenticated;

COMMENT ON FUNCTION public.increment_own_daily_export_usage(DATE, INTEGER)
  IS 'Atomically increments the current authenticated users daily export count and returns whether the configured limit allows the export.';

