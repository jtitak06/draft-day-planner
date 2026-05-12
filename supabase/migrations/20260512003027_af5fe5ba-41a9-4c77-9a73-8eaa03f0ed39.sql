-- 1. paid_access table
CREATE TABLE public.paid_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  stripe_session_id text NOT NULL UNIQUE,
  paid_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX paid_access_email_lower_idx ON public.paid_access (lower(email));
CREATE INDEX paid_access_user_id_idx ON public.paid_access (user_id);

ALTER TABLE public.paid_access ENABLE ROW LEVEL SECURITY;

-- Users can only read their own paid_access row.
CREATE POLICY "Users can view their own paid_access"
ON public.paid_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No client-side inserts/updates/deletes (webhook + trigger handle writes via service role).

-- 2. Function: enforce that signups have a paid_access row, and link user_id.
CREATE OR REPLACE FUNCTION public.handle_new_user_paid_gate()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_id uuid;
BEGIN
  SELECT id INTO v_row_id
  FROM public.paid_access
  WHERE lower(email) = lower(NEW.email)
  LIMIT 1;

  IF v_row_id IS NULL THEN
    RAISE EXCEPTION 'Account creation requires a completed purchase. Please pay first using the email %.', NEW.email
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE public.paid_access
  SET user_id = NEW.id
  WHERE id = v_row_id;

  RETURN NEW;
END;
$$;

-- 3. Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_paid_gate ON auth.users;
CREATE TRIGGER on_auth_user_created_paid_gate
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_paid_gate();