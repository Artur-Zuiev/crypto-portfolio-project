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
