# Crypto Portfolio

**A responsive full-stack cryptocurrency portfolio tracker** built with Java 21, Spring Boot, PostgreSQL, vanilla JavaScript, and Three.js.

Track fictional portfolio trades, monitor holdings and profit/loss, and explore assets in an interactive 3D view.

[Features](#features) · [Technology](#technology) · [Getting started](#getting-started) · [Mobile preview](#mobile-preview) · [Architecture](#architecture) · [Testing](#testing)

> **Demo portfolio / learning project.** This application records simulated portfolio transactions; it does not execute cryptocurrency trades or provide investment advice. A publicly hosted demo is not available yet.

## Features

| Area | What it demonstrates |
| --- | --- |
| Accounts | Registration, login, and JWT-secured user-specific portfolio data |
| Portfolio | Holding quantities, average purchase costs, current valuations, sorting, and filtering |
| Trading history | Simulated BUY and SELL records, including partial sales and fractional quantities |
| Financial metrics | Unrealized P/L, realized P/L from recorded sales, combined P/L, and per-asset performance |
| Visualization | Portfolio allocation donut, observed portfolio value history, and interactive Three.js scene |
| Responsive UI | Desktop, tablet and phone layouts, touch-sized controls and mobile asset cards |

**Financial precision:** Values are computed on the backend using `BigDecimal` for transaction quantities and prices. Ordinary EUR figures are displayed to two decimal places. Very small non-zero gains or losses can show additional digits so they are not mistaken for zero.

**Realized P/L:** Recorded BUY/SELL transactions are replayed chronologically using a weighted-average cost basis. If a sale cannot be matched to recorded purchases, the application reports incomplete transaction history rather than inventing a result. Trading fees and taxes are not included.

**Value history:** The graph records actual portfolio valuations observed in the current browser over time. It is *not* a historical market-price reconstruction, and observations do not synchronize across devices.

## Technology

| Layer | Stack |
| --- | --- |
| Backend | Java 21, Spring Boot 4.0.6, Spring Web MVC, Spring Security, Spring Data JPA |
| Data | PostgreSQL, JPA, `BigDecimal` |
| Authentication | JWT (JJWT), BCrypt |
| Frontend | HTML5, modular CSS, vanilla JavaScript |
| 3D visualization | Three.js |
| Testing / CI | JUnit 5, Maven, Node.js smoke tests, GitHub Actions |

## Getting started

### Prerequisites

- Java Development Kit 21
- PostgreSQL running locally
- Maven Wrapper included in the backend
- A local static file server (for example, VS Code Live Server or Python)

### 1. Set up the database and backend

Create a PostgreSQL database named `crypto_portfolio`. **Do not run any initialization or bootstrap profile against a database containing data you want to keep.** The normal application uses schema validation, so a fresh database needs its schema created first according to the backend's existing setup/bootstrap process.

Set these environment variables in IntelliJ IDEA or your local terminal:

| Variable | Example / purpose |
| --- | --- |
| `DB_URL` | `jdbc:postgresql://localhost:5432/crypto_portfolio` |
| `DB_USERNAME` | Your local PostgreSQL user, e.g. `postgres` |
| `DB_PASSWORD` | Your local PostgreSQL password |
| `JWT_SECRET` | A securely generated secret of at least 32 UTF-8 bytes |

Never commit passwords, JWT signing keys, or access tokens.

From `backend/cryptoportfolio`, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend normally listens on port `8080`. On an existing configured database, keep the `Active profiles` field empty in IntelliJ IDEA.

### 2. Start the frontend

Serve the `frontend` directory over HTTP, for example:

```powershell
cd frontend
py -m http.server 5500
```

Open **http://localhost:5500/login.html** and create an account. The frontend calls the backend on the same hostname, port `8080`.

## Mobile preview

The website is responsive, including authentication screens, the dashboard, transactions, holding cards, and the 3D scene. This is a mobile **web interface**, not a native app.

To test from a phone on a **trusted private Wi-Fi**:

1. Find your Windows PC's local IPv4 address with `ipconfig` (example: `192.168.1.50`).
2. Add `MOBILE_FRONTEND_ORIGIN=http://192.168.1.50:5500` to the backend's environment, using **your actual IP**, then restart the backend.
3. Make sure the backend is reachable from other devices on the private LAN. Run the frontend from `frontend/` with `py -m http.server 5500 --bind 0.0.0.0`.
4. Open `http://192.168.1.50:5500/login.html` in your phone's browser. Allow Java and the frontend server in Windows Firewall for the **Private** network only if needed.

Do not expose the local development ports through a router, use this HTTP testing setup on a public network, or deploy it on the internet as-is. The phone uses its own browser session and observed-value history.

## Architecture

```text
frontend/
  dashboard.html        Dashboard, forms, metrics and holdings
  transactions.html     Filterable transaction history
  scene.html            Interactive 3D portfolio
  login.html            Login
  register.html         Registration
  css/                  Shared and page-specific responsive styles
  js/                   Frontend behavior and API requests
  tests/                Frontend smoke / formatting tests

backend/cryptoportfolio/
  src/main/java/.../
    controller/          REST endpoints
    service/             Portfolio, pricing and accounting rules
    model/               JPA entities
    repository/          Database access
    config/              Authentication and security configuration
  src/test/              Backend regression tests
```

The client sends JSON requests to the Spring Boot API. Protected portfolio endpoints require an authenticated session. PostgreSQL stores accounts, holdings and transactions. The 3D visualization and browser-local value observations use portfolio data from the API.

For implementation details see [Frontend architecture](frontend/PROJECT_STRUCTURE_README.md) and [CSS organization](frontend/CSS_STRUCTURE_README.md).

## Testing

This feature branch uses GitHub Actions to run selected backend tests and frontend JavaScript syntax / Node smoke tests. It includes regression checks for transaction precision, partial sales, financial summaries, crypto catalog initialization, JWT operations, responsive navigation, and euro formatting.

You can inspect the checks under **Actions** or in [Pull Request #3](https://github.com/Artur-Zuiev/crypto-portfolio-project/pull/3).

### Manual acceptance checklist

- Login and registration succeed; authenticated requests are scoped to the correct account.
- BUY and SELL work with fractional quantities and the correct remaining holdings.
- Realized, unrealized and combined P/L are consistent with the transaction history.
- Search, sorting, filters and transaction history work.
- Charts and 3D assets render; camera reset and animation pause work.
- On phone widths around 320–430px, buttons and labels remain readable, and there is no unexpected horizontal page scrolling.

## Deploy on Railway (single HTTPS URL)

This branch includes a root `Dockerfile` that builds the Java 21 backend and copies the frontend into the same runtime. The frontend requests the API from the same HTTPS origin in production; local Live Server on port 5500 continues to use the Java API on port 8080.

1. Create a **new Railway project** and add a **PostgreSQL database**. Use a fresh, disposable/demo database: **do not import personal local credentials or the existing Windows database**.
2. Add a service from GitHub repository `Artur-Zuiev/crypto-portfolio-project` using branch `design/fintech-dashboard-v1-2026`. The service should detect the `Dockerfile` in the repository root.
3. Configure the following backend service variables. Use Railway reference variables for the actual Postgres service rather than hardcoded credentials:

   | Variable | Value |
   | --- | --- |
   | `DB_URL` | `jdbc:postgresql://<postgres-host>:<postgres-port>/<database>` from Railway Postgres |
   | `DB_USERNAME` | Railway Postgres username |
   | `DB_PASSWORD` | Railway Postgres password (secret) |
   | `JWT_SECRET` | A fresh random secret, at least 32 UTF-8 bytes |
   | `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` **only for the first start against an empty demo database** |

   The Postgres host/port and credentials are provider-assigned values, not values copied from a local Windows installation. Once the schema exists, **remove** `SPRING_JPA_HIBERNATE_DDL_AUTO` so normal `validate` applies on subsequent starts. Never apply automatic schema creation/update to an existing production database without reviewed migrations.
4. Generate a public HTTPS domain for the app service on Railway. Check `/login.html` and `/api/test` under **the same hostname**, then register a fresh demo account.
5. Test BUY, SELL, transaction history, P/L and 3D UI before sharing the link. Keep ports private and do not publish any secrets.

This project is an educational demonstration. Before allowing untrusted users, add production protections such as registration abuse controls, rate limits, secret rotation, backup/restore, monitored database migrations and security review.

## Project status

**Feature development / local acceptance testing.** The enhanced dashboard and responsive UI currently live on branch `design/fintech-dashboard-v1-2026` in [PR #3](https://github.com/Artur-Zuiev/crypto-portfolio-project/pull/3). A production deployment and public demo are future steps, not completed features.

To turn this into a public demo, the next work should include a deployment-ready configuration, HTTPS, hosted PostgreSQL, environment-based secrets, rate limiting, stable market-data error handling, and a demo account or isolated seeded data. Screenshots should be added after validating the final UI on desktop and mobile.

---

Built by **[Artur Zuiev](https://github.com/Artur-Zuiev)** · Austria
