# BigDecimal migration — application code prepared, database migration pending

The branch now uses `BigDecimal` for stored transaction quantities/prices, portfolio quantities/average prices, request DTOs, portfolio calculations, and JSON response fields. Market-price ingestion (`CryptoCurrency.currentPrice`) still enters as `Double`; the portfolio service explicitly converts it with `BigDecimal.valueOf`. Full end-to-end precision for upstream market feeds is a separate improvement.

**Do not merge this branch into an environment that contains the old database schema.** The application uses `spring.jpa.hibernate.ddl-auto=validate` on this branch so it cannot silently alter the schema. It will refuse to start against incompatible columns until an approved migration is applied.

## Step 1 — check the actual database and back it up

The legacy archive named the database `cryptoportfolio`; the newer default config uses `crypto_portfolio`. Confirm which is in use in IntelliJ `DB_URL` before proceeding. On the machine with PostgreSQL tools:

```powershell
# Replace the database name with your actual DB_URL database name
$database = "crypto_portfolio"
pg_dump -U postgres -Fc -f "$database-before-bigdecimal.dump" $database
```

Never upload the dump or credentials to GitHub. Confirm `pg_dump` exited with code zero and verify the backup via `pg_restore --list`. Prefer to test restoration into a throwaway DB before doing anything to the main database.

## Step 2 — verify the existing schema

Use pgAdmin or psql on a **restored copy** to inspect `portfolio_items` and `transactions` column names/types and confirm the existing values fit `NUMERIC(38,18)`. Stored `double precision` values may already have lost precision, which a migration cannot recover.

## Step 3 — migrate the restored copy first

Review and execute `docs/sql/decimal_migration_DRAFT.sql` **only** on the restored test copy after checking all columns. Verify row counts, totals and a representative set of old transactions before and after. Then run the new application against that copy with environment variables supplied locally and test BUY, SELL, tiny fractional amounts, full sale, partial sale, auth, portfolio summary and 3D UI. The SQL file is not automatically executed by CI or Spring Boot.

## Step 4 — production rollout only after successful testing

Schedule maintenance, stop writes, take a fresh backup, apply the reviewed SQL and start the new application. If startup fails, do not change data manually or run random SQL; restore the backup into a separate database and investigate.

## Current automated coverage

GitHub Actions executes targeted precision/JWT tests and checks frontend JavaScript syntax. It does **not** prove the application works against an upgraded PostgreSQL schema; end-to-end DB tests remain necessary.
