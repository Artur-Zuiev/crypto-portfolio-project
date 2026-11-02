# Financial precision migration — staged, not yet applied

**Current status:** Existing Java entities and incoming DTOs still use `Double`. This
document is a migration proposal and does **not** claim that the full BigDecimal
conversion has been completed. The existing dashboard now returns quantities
without rounding to two decimal places.

## Before changing types

1. Stop writes to the application.
2. Confirm the actual PostgreSQL DB name: the legacy archive and newer config
   use different names. Do not guess.
3. Create an offline backup using pg_dump (substitute your real DB name):
   `pg_dump -U postgres -Fc -f crypto_portfolio_before_decimal.dump crypto_portfolio`
4. Verify backup readability and test restoring into a **separate test DB**.
5. Inspect actual PostgreSQL column names and types with psql `\\d portfolio_items`,
   `\\d transactions`. ORM naming strategies can differ.
6. Only if confirmed, review `docs/sql/decimal_migration_DRAFT.sql` and
   test it on the restored copy first.

## Proposed next code migration

- Convert `PortfolioItem.quantity`, `PortfolioItem.averageBuyPrice`,
  `Transaction.quantity`, `Transaction.price`, and related request/response
  DTO fields to `BigDecimal`.
- Use `@Column(precision = 38, scale = 18)` and explicit validation for
  positive amounts, scale and maximum digits.
- Update `TransactionService` and `PortfolioService` so all quantity,
  average-price, total-invested and P/L calculations stay decimal end-to-end.
- Review `CryptoCurrency.currentPrice` and market capitalization range
  separately; do not assume one precision suits all values.
- Retain the existing JSON numeric field names and verify frontend behavior
  (JavaScript Number cannot exactly represent arbitrary 18-digit decimals).
- Test buying 0.00000001, selling entire holdings, partial sale with tiny
  remainder, weighted average purchase price, negative/zero input rejection,
  and balance after server restart.

**Important:** `spring.jpa.hibernate.ddl-auto=update` does not replace a
reviewed DB migration. Change to `validate` after controlled schema migration
and tests confirm the mapping. Do not merge or run SQL against your real DB
until restored-copy testing is complete.
