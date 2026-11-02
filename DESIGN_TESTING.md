# Local setup and redesign verification

This branch keeps the existing Crypto Portfolio API, database entities, and frontend JavaScript behavior while updating presentation.

## Why the uploaded legacy copy is not used verbatim
The older archive uses an embedded JWT signing key and committed database credentials. Do **not** copy its `application.properties` or `JwtService.java` over the security-fixed GitHub version. Keep secrets out of commits.

## Start backend (IntelliJ IDEA on Windows)
1. Open `backend/cryptoportfolio` as a Maven module and select JDK 21.
2. Run `com.artur.cryptoportfolio.CryptoportfolioApplication` using a Spring Boot configuration.
3. Under **Run > Edit Configurations > Environment variables**, supply:
   - `JWT_SECRET`: a fresh random secret of at least 32 UTF-8 bytes.
   - `DB_USERNAME`: your local PostgreSQL username, usually `postgres`.
   - `DB_PASSWORD`: your local PostgreSQL password.
   - `DB_URL` (optional): `jdbc:postgresql://localhost:5432/crypto_portfolio`. **Note:** the uploaded older project used the database name `cryptoportfolio` (no underscore); set `DB_URL` to the database you actually use. Do not accidentally connect to the wrong database.
4. Wait for `Started CryptoportfolioApplication` in the Run console. If you see `exit code 1`, find the first `Caused by:` line.

## Start frontend
Serve the repository root with VS Code Live Server; open `frontend/login.html` from `http://127.0.0.1:5500`. The frontend calls `http://localhost:8080/api`, so the backend must already be running.

Check login or register, dashboard, actual holdings and transactions, responsive display, and the separate 3D scene before merging the draft PR. The redesigned cards show **real application data**, not the synthetic figures in the visual reference.

## Tests and security
Run Maven `test` from the backend module. Maven test runs do not inherit the Spring Boot Run configuration's environment; set DB variables in the Maven Runner as needed. For a robust CI pipeline, integration tests should eventually use an isolated database (e.g. Testcontainers), not a developer's database.

Do not commit local passwords, JWT signing keys, database dumps, or users' financial data. The design PR is staged for manual browser review, not validated as fully production-ready.
