-- Enforce private score quotas at the database layer.
-- App routes also check this for better UX, but the trigger prevents direct
-- Supabase client inserts from bypassing the limit.

CREATE OR REPLACE FUNCTION public.enforce_private_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_private_limit INTEGER;
  v_private_count INTEGER;
  v_is_plus BOOLEAN;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.owner_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.is_public, false) = true THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
    AND OLD.owner_user_id = NEW.owner_user_id
    AND COALESCE(OLD.is_public, false) = false
  THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = NEW.owner_user_id
      AND status = 'active'
      AND current_period_end > NOW()
  )
  INTO v_is_plus;

  v_private_limit := CASE WHEN v_is_plus THEN 100 ELSE 5 END;

  SELECT COUNT(*)
  INTO v_private_count
  FROM public.scores
  WHERE owner_user_id = NEW.owner_user_id
    AND COALESCE(is_public, false) = false;

  IF v_private_count >= v_private_limit THEN
    RAISE EXCEPTION 'PRIVATE_SCORE_LIMIT_REACHED: maximum % private scores allowed', v_private_limit
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_enforce_private_score_limit ON public.scores;
CREATE TRIGGER trg_enforce_private_score_limit
BEFORE INSERT OR UPDATE OF is_public, owner_user_id ON public.scores
FOR EACH ROW
EXECUTE FUNCTION public.enforce_private_score_limit();

REVOKE ALL ON FUNCTION public.enforce_private_score_limit() FROM PUBLIC;

COMMENT ON FUNCTION public.enforce_private_score_limit()
  IS 'Prevents non-service-role users from creating or converting more private scores than their current entitlement allows.';

