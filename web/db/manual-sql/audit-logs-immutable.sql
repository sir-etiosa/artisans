-- Blocks UPDATE/DELETE on audit_logs at the DB layer, regardless of which
-- role or app code touches the table. Combined with the hash chain, this
-- means tampering isn't just detectable — it's actively rejected.
--
-- Not managed by drizzle-kit (triggers aren't part of the schema files) —
-- run manually against the DB after `npm run db:push` creates the table.
CREATE OR REPLACE FUNCTION audit_logs_block_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs is append-only: % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_logs_no_update ON audit_logs;
CREATE TRIGGER audit_logs_no_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_block_mutation();

DROP TRIGGER IF EXISTS audit_logs_no_delete ON audit_logs;
CREATE TRIGGER audit_logs_no_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION audit_logs_block_mutation();
