# Prep Tracker

Prep Tracker is a small monorepo with a React + Vite frontend, an Express + GraphQL API, and Playwright end-to-end tests.

## Requirements

- Node.js
- npm
- Docker, if you want to use the Compose setups

## Setup

Install dependencies:

```bash
npm install
```

Create the local environment file:

```bash
cp .env.local.example .env.local
```

For production, use the root `.env` file.

Run database migrations after PostgreSQL is available:

```bash
ENV_FILE=.env.local npm run db:migrate
```

Run the seed when you need to populate the database with development data:

```bash
ENV_FILE=.env.local SEED_ALLOW_DESTRUCTIVE=true npm run seed
```

The seed is destructive and clears the existing database before inserting seed data, so `SEED_ALLOW_DESTRUCTIVE=true` must be explicitly provided.

## Run Locally

Start both applications:

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

The development setup uses `docker-compose.dev.yml`.

### Local PostgreSQL

Start the development stack with the local PostgreSQL container:

```bash
npm run docker:local
```

On the first run, or after changing a Dockerfile or installed dependencies, build the images first:

```bash
npm run docker:local -- --build
```

The `local-db` Compose profile starts the PostgreSQL container. Without this profile, the API can instead connect to Aiven using the same `.env.local` file.

### Aiven PostgreSQL

To use the remote Aiven PostgreSQL instance:

1. In `.env.local`, comment out the local PostgreSQL variables.
2. Uncomment the Aiven PostgreSQL variables.
3. Start the development stack:

```bash
npm run docker:aiven
```

The same `.env.local` file is used for both local PostgreSQL and Aiven. Only the active database variables change.

To rebuild the development images:

```bash
npm run docker:aiven -- --build
```

### Production

The production-like stack uses `docker-compose.yml` and the root `.env` file:

```bash
npm run docker:prod
```

The production command includes `--build`, so the images are rebuilt before starting the stack.

## Database Commands

### Migrations

Run migrations using the environment selected by `ENV_FILE`:

```bash
ENV_FILE=.env.local npm run db:migrate
```

The migration command can be run from the host. With local PostgreSQL, `DB_LOCAL_HOST=localhost` is used to connect through the port published by the PostgreSQL container.

When using Aiven, the active `DB_HOST`, `DB_PORT`, and optional `DB_SSLMODE` values from `.env.local` are used instead.

### Seed

Seed the development database with initial data:

```bash
ENV_FILE=.env.local SEED_ALLOW_DESTRUCTIVE=true npm run seed
```

The seed:

- clears the existing development data
- creates users
- creates topics and questions
- creates notes and tags
- creates relationships between them

Because the seed truncates existing tables, `SEED_ALLOW_DESTRUCTIVE=true` is required as an explicit safety flag.

## Environment

The project currently uses two environment files:

- `.env.local` - local development and Aiven development
- `.env` - production

## Project Structure

- `apps/web` - frontend app
- `apps/api` - backend app
- `e2e/playwright` - end-to-end tests
- `scripts` - utility scripts such as database seeding
- `docs/workflow.md` - branch, commit, issue, and delivery workflow

## Workflow

See [docs/workflow.md](docs/workflow.md) for branch naming, commit format, labels, and delivery flow.
