# NetNum assignment - Billing System

A simple backend service for usage-based billing, built with **Node.js**, **TypeScript**, **Express**, **Prisma**, and **SQLite**.

The system allows customers to consume products, tracks usage asynchronously, and bills customers periodically via a cron job.

---

## Features

- Record product usage (customer “buys” or consumes something)
- Credit customer wallets with funds
- Asynchronous billing via cron job (each minute for this task)
- Retrieve customer balance and usage history
- Automated tests covering main business flows
- Seeded data for easy local testing

---

## Tech Stack

- Node.js + TypeScript  
- Express  
- Prisma ORM  
- SQLite  
- Jest (testing)  
- node-cron (cron job)

---

## Project Structure

```
src/
├── app.ts
├── index.ts
├── prisma.ts
├── routes/
│   ├── usage.routes.ts
│   ├── wallet.routes.ts
│   ├── customer.routes.ts
│   ├── product.routes.ts
│   └── event.routes.ts (optional / audit)
├── services/
│   ├── billing.service.ts
│   └── wallet.service.ts
└── cron/
    └── billing.cron.ts

tests/
├── billing.test.ts
├── basic.test.ts
└── setup.ts
```

---

## Setup & Run

### 1. Install dependencies

```bash
npm install
```

---

### 2. Environment variables

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
```

---

### 3. Setup database

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

---

### 4. Run the server

```bash
npm run dev
```

Server will be available at:

```
http://localhost:3000
```

---

## API Overview

### Products

```http
GET /products
```

Returns the list of available products.

---

### Customers (read-only)

```http
GET /customers
```

Returns all customers with their current wallet balance.

---

### Add Funds to Wallet

```http
POST /wallet/credit
```

**Request body**

```json
{
  "customerId": "<customer-id>",
  "amount": 10
}
```

Amount is provided in **dollars**.

---

### Submit Usage (Customer buys something)

```http
POST /usage
```

**Request body**

```json
{
  "customerId": "<customer-id>",
  "productId": "<product-id>",
  "units": 3
}
```

Usage is recorded immediately.  
Billing happens asynchronously.

---

### Get Customer Balance & Usage

```http
GET /customers/:id/balance
```

Returns:
- current balance
- usage history
- `hasFunds` flag

---

### Events (optional / audit)

```http
GET /events
GET /events/customers/:customerId
```

Exposes system-generated audit events (e.g. usage recorded, wallet credited).

> Events are informational only and do not drive business logic.

---

## Billing & Cron

- Billing runs **once per minute** via a cron job
- Unprocessed usage events are billed
- Wallet balances are updated
- Usage events are marked as processed
- Billing is idempotent (no double charging)

Cron timing itself is not tested; billing logic is tested directly for determinism.

---

## Testing

Run all tests:

```bash
npm test
```

Tests cover the main flows required by the assignment:
- submitting usage
- adding funds
- retrieving balance
- cron-based billing behavior

A real SQLite test database is used for integration tests.

---

## Design Notes

- Monetary values are stored as **integer cents** to avoid floating-point issues
- Usage ingestion is decoupled from billing for reliability
- The database is the single source of truth
- Routes handle HTTP concerns only; business logic lives in services
- Events (if enabled) are audit records, not commands

---

## Manual Testing

Seeded data is available.  
Use `GET /customers` and `GET /products` to retrieve IDs, then use Postman or curl to exercise the API.

---

## Notes

This project focuses on clarity, correctness, and testability rather than over-engineering or premature abstraction.

## Possible Improvements

The following improvements were intentionally left out to keep the solution focused and aligned with the assignment scope. They would be natural next steps in a production-ready system:

- **Input validation**
  - Validate request payloads using a schema validation library (e.g. Zod, Joi)
  - Ensure required fields are present and well-formed
  - Enforce constraints such as `units > 0` and `amount > 0`

- **Centralized error handling**
  - Introduce a global error-handling middleware
  - Standardize error responses across all endpoints

- **Authentication & authorization**
  - Protect wallet and event endpoints
  - Separate customer-facing APIs from admin/debug endpoints

- **Pagination & filtering**
  - Paginate usage history and events
  - Allow filtering by date range or product

- **Stronger transactional guarantees**
  - Wrap wallet updates and billing logic in explicit database transactions
  - Add retry logic for transient failures

- **Configuration & scalability**
  - Make cron interval configurable via environment variables
  - Support batching or sharding of billing jobs

- **Observability**
  - Structured logging
  - Metrics for billing cycles and failures
  - Alerting on negative balances or failed billing runs