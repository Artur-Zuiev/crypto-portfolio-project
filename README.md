# Crypto Portfolio

A full-stack portfolio project for tracking cryptocurrency holdings and transactions, built with **Java 21**, **Spring Boot**, **PostgreSQL**, and a browser-based **HTML/CSS/JavaScript** frontend.

> **Portfolio project:** This repository showcases application development, backend APIs, authentication, data persistence, and a custom user interface. It is not financial advice or a production trading service.

## What the project includes

- Registration and login pages
- Portfolio dashboard with holdings and summary cards
- Buy/sell transaction entry and transaction history
- Portfolio filtering, sorting, editing, and deletion controls
- Portfolio allocation visualization
- A separate 3D interface built with Three.js

The frontend and backend are kept in separate directories.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Backend | Java 21, Spring Boot 4, Spring Security, Spring Data JPA, Bean Validation |
| Data | PostgreSQL |
| Authentication | Spring Security and JJWT |
| Frontend | HTML, modular CSS, JavaScript |
| Visualization | Three.js |
| Build | Maven Wrapper |

## Repository structure

```text
.
├── backend/
│   └── cryptoportfolio/
│       ├── pom.xml
│       ├── mvnw
│       └── src/
└── frontend/
    ├── dashboard.html
    ├── login.html
    ├── register.html
    ├── transactions.html
    ├── scene.html
    ├── css/
    └── js/
```

Additional frontend implementation notes:
- [Frontend architecture](frontend/PROJECT_STRUCTURE_README.md)
- [CSS organization](frontend/CSS_STRUCTURE_README.md)

## Getting started

### Requirements

- JDK 21
- PostgreSQL
- A modern browser
- Maven is optional because the backend contains the Maven Wrapper

### Backend

1. Clone the repository.
2. Create a local PostgreSQL database.
3. Review the backend configuration under `backend/cryptoportfolio/src/main/resources/` and provide the required database and authentication settings **locally**. Do not commit passwords, private keys, or tokens.
4. From `backend/cryptoportfolio`, run:

```bash
./mvnw spring-boot:run
```

On Windows use `mvnw.cmd spring-boot:run`.

### Frontend

The frontend is located in `frontend/`. It contains standalone HTML pages and JavaScript that communicate with the backend.

For local development, serve the `frontend` folder using a local HTTP server (for example, `python3 -m http.server 5500` from that directory), then open `http://localhost:5500/login.html`.

Check the frontend API base URL and the backend CORS settings for your local environment. The exact database configuration and end-to-end setup may need adjustment; a fully working deployment is **not** claimed here.

## Portfolio analytics (dashboard update)

The dashboard distinguishes:
- **Unrealized P/L:** change in the market value of current positions versus their weighted-average purchase cost.
- **Realized P/L:** gain or loss from recorded sales. The authenticated endpoint `GET /api/portfolio/performance/realized` replays BUY/SELL history chronologically with a weighted-average cost basis using `BigDecimal`.
- **Combined P/L:** realized plus unrealized amounts, displayed only when the recorded sale history can be matched to buys.
- **Value history:** genuine observations of portfolio value taken while the dashboard is opened/refreshed and stored **locally in that browser**, per logged-in account (up to 90 days/360 samples). This is not a reconstructed historical-price chart and does not sync between devices.

Realized P/L does not include trading fees or taxes. Direct editing/deleting of holdings bypasses the trade ledger and can make historic cost reconciliation incomplete. Unmatched sales are explicitly reported instead of inventing a profit. The system is a demonstration portfolio tracker, not accounting software.

Tiny nonzero gains/losses retain additional decimals, while normal euro values use two decimal places. The 3D view provides reset-camera and pause-motion controls (and respects the operating system's reduced-motion preference).

### Final local verification

1. Keep the existing `crypto_portfolio` PostgreSQL database; no new tables are required for these analytics. Start Java 21 backend with the existing local `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` variables, with no `bootstrap` profile.
2. Serve the updated `frontend/` files (e.g. Live Server on port 5500) and log in.
3. Confirm that Realized/Unrealized/Combined P&L cards load. The existing recorded BTC partial sale should appear in Realized P/L.
4. Refresh the dashboard at different times to create genuine history observations. The chart will initially say it needs another observation.
5. Test 3D Reset view, Pause motion, asset selection, and Reload 3D.
6. Verify that holdings, BUY/SELL history and fractional amounts have not changed. Only then consider merging the feature branch.

## Use on a phone (same Wi-Fi as your Windows PC)

The frontend adapts to narrow screens (320px and wider), including the portfolio cards, BUY/SELL flow, full transaction history, sign-in forms, trend chart, and touch-friendly 3D visualization. This is a **mobile browser version**, not an installable Android/iOS application.

Both devices must be connected to a trusted local Wi-Fi network. Start the Spring Boot backend on your PC with Java 21 and your existing database/JWT environment variables, plus:

```text
MOBILE_FRONTEND_ORIGIN=http://192.168.1.50:5500
```

Replace `192.168.1.50` with your Windows PC's current LAN IPv4 address (find it with `ipconfig`). The origin must exactly match the address you will type on the phone; this setting deliberately does **not** allow arbitrary websites to access authenticated endpoints.

Run the frontend from the `frontend` folder on your PC, for example:

```powershell
py -m http.server 5500 --bind 0.0.0.0
```

Then open `http://192.168.1.50:5500/login.html` on your phone. The frontend automatically contacts the **same host** on port 8080 for the Java API. A server bound to localhost only will not be reachable from the phone.

If Windows asks about network access, allow Python and Java only on the trusted **Private** network (not Public). Never forward ports 5500 or 8080 through your internet router, and do not use this unencrypted HTTP development setup on public Wi-Fi. Login again on the phone because its browser has its own token storage. Stop the servers after testing. The observed history chart is local to each browser and does not sync across devices.

## Code organization

The frontend styles are separated into reusable foundational rules and page-specific blocks. JavaScript files are organized by UI responsibility. The backend follows Spring Boot's application structure.

## What this demonstrates

- Designing and organizing a full-stack application
- Building backend features with Spring and persistence with JPA
- Handling authenticated user workflows
- Presenting financial-style data in a responsive interface
- Creating an additional interactive 3D view

## Project status

An evolving personal learning and portfolio project. Before using this code in a real financial or public-facing context, review security, configuration, tests, and deployment readiness.

---

**Developer:** [Artur Zuiev](https://github.com/Artur-Zuiev) · Austria
