-- REVIEW AND BACK UP YOUR DATABASE BEFORE RUNNING THIS SCRIPT.
-- This is a manual draft, NOT a startup migration.
-- Existing double-precision numbers cannot recover precision already lost.
BEGIN;
ALTER TABLE portfolio_items
  ALTER COLUMN quantity TYPE numeric(38,18) USING quantity::numeric(38,18),
  ALTER COLUMN average_buy_price TYPE numeric(38,18) USING average_buy_price::numeric(38,18);
ALTER TABLE transactions
  ALTER COLUMN quantity TYPE numeric(38,18) USING quantity::numeric(38,18),
  ALTER COLUMN price TYPE numeric(38,18) USING price::numeric(38,18);
-- CryptoCurrency currentPrice and marketCap will be handled after checking
-- actual ranges and precision; do not change them blindly.
COMMIT;
