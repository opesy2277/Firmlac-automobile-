
-- Firmlac Automobile: secure owner-only administrator management.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.authorized_profile_role_changes (
  transaction_id bigint NOT NULL,
  profile_id uuid NOT NULL,
  PRIMARY KEY (transaction_id, profile_id)
);

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE private.authorized_profile_role_changes
FROM PUBLIC, anon, authenticated;

-- Block admin assignment during profile creation and unauthorized role changes.
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_type = 'admin' THEN
      RAISE EXCEPTION 'Only the Firmlac owner can assign administrator access.';
    END IF;

    RETURN NEW;
  END IF;

  IF NEW.user_type IS DISTINCT FROM OLD.user_type
     AND NOT EXISTS (
       SELECT 1
       FROM private.authorized_profile_role_changes AS a
       WHERE a.transaction_id = pg_catalog.txid_current()
         AND a.profile_id = NEW.id
     )
  THEN
    RAISE EXCEPTION 'Use the authorized owner operation to change profile roles.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL
ON FUNCTION public.prevent_profile_role_escalation()
FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prevent_profile_admin_insert ON public.profiles;

CREATE TRIGGER prevent_profile_admin_insert
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- Owner-only function to grant or revoke administrator access.
CREATE OR REPLACE FUNCTION public.owner_set_profile_admin_role(
  p_user_id uuid,
  p_make_admin boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  caller_email text;
  target_email text;
  target_role text;
  current_transaction_id bigint;
BEGIN
  caller_email := pg_catalog.lower(
    coalesce(auth.jwt() ->> 'email', '')
  );

  IF caller_email <> 'oluwayemiopeyemi2010@gmail.com' THEN
    RAISE EXCEPTION 'Only the Firmlac owner can manage administrators.';
  END IF;

  IF auth.uid() IS NULL
     OR p_user_id IS NULL
     OR p_make_admin IS NULL
  THEN
    RAISE EXCEPTION 'A valid user and action are required.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own administrator role.';
  END IF;

  SELECT pg_catalog.lower(u.email), p.user_type
  INTO target_email, target_role
  FROM auth.users AS u
  JOIN public.profiles AS p ON p.id = u.id
  WHERE u.id = p_user_id
  FOR UPDATE OF p;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'The user or their profile was not found.';
  END IF;

  IF target_email = 'oluwayemiopeyemi2010@gmail.com' THEN
    RAISE EXCEPTION 'The owner account cannot be demoted.';
  END IF;

  IF p_make_admin AND target_role <> 'admin' THEN
    current_transaction_id := pg_catalog.txid_current();

    INSERT INTO private.authorized_profile_role_changes
      (transaction_id, profile_id)
    VALUES (current_transaction_id, p_user_id);

    UPDATE public.profiles
    SET user_type = 'admin'
    WHERE id = p_user_id;

    DELETE FROM private.authorized_profile_role_changes
    WHERE transaction_id = current_transaction_id
      AND profile_id = p_user_id;

  ELSIF NOT p_make_admin AND target_role = 'admin' THEN
    current_transaction_id := pg_catalog.txid_current();

    INSERT INTO private.authorized_profile_role_changes
      (transaction_id, profile_id)
    VALUES (current_transaction_id, p_user_id);

    UPDATE public.profiles
    SET user_type = 'buyer'
    WHERE id = p_user_id;

    DELETE FROM private.authorized_profile_role_changes
    WHERE transaction_id = current_transaction_id
      AND profile_id = p_user_id;
  END IF;
END;
$$;

REVOKE ALL
ON FUNCTION public.owner_set_profile_admin_role(uuid, boolean)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE
ON FUNCTION public.owner_set_profile_admin_role(uuid, boolean)
TO authenticated;
