-- Seed towns via migration (idempotent via ON CONFLICT)
BEGIN;

-- Ensure towns table exists
DO $$ BEGIN
  PERFORM 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'towns';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Table public.towns does not exist; run migrations creating towns first.';
  END IF;
END $$;

\i '../seeders/20251007093000_seed_towns.sql'

COMMIT;


