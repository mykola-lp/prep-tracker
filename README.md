# Prep Tracker

Prep Tracker is a small monorepo with a React + Vite frontend, an Express + GraphQL API, and Playwright end-to-end tests.

## Requirements

- Node.js
- npm
- Docker, if you want to use the Compose setups

## Setup

```bash
npm install
```

Choose the environment file for the mode you want:

```bash
cp .env.local.example .env.local
# or
cp .env.aiven-dev.example .env.aiven-dev
# for tests
cp .env.test.example .env.test
```

Run database migrations after PostgreSQL is available:

```bash
npm run db:migrate
```

## Run Locally

Start both apps:

```bash
npm run dev
```

Run the frontend only:

```bash
npm run dev:web
```

Run the API only:

```bash
npm run dev:api
```

By default:

- the web app runs on `http://localhost:5173`
- the API runs on `http://localhost:3001`

## Tests

Run the relevant test set for your change:

```bash
npm run test:web
npm run test:api
npm run test:e2e
```

Other useful checks:

```bash
npm run format:check
npm run format
npm run check:branch-name
npm run check:commit-message
```

## Docker

Development stack with local PostgreSQL:

```bash
docker compose --env-file .env.local -f docker-compose.dev.yml --profile local-db up --build
```

Development stack with Aiven PostgreSQL:

```bash
docker compose --env-file .env.aiven-dev -f docker-compose.dev.yml up --build
```

Production-like local stack:

```bash
docker compose -f docker-compose.yml up --build
```

## Project Structure

- `apps/web` - frontend app
- `apps/api` - backend app
- `e2e/playwright` - end-to-end tests
- `docs/workflow.md` - branch, commit, issue, and delivery workflow

## Environment

Environment values live in root mode-specific files and are documented in the matching examples.

Common variables include:

- `VITE_API_BASE_URL`
- `DATABASE_URL`
- `TEST_DATABASE_URL`
- `CLIENT_ORIGIN`
- `PORT`

## Workflow

See [docs/workflow.md](docs/workflow.md) for branch naming, commit format, labels, and delivery flow.
