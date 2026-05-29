# Workflow

This document describes the working conventions for the repository: issue structure, labels, branch naming, commit naming, pull requests, and delivery flow.

## Issue Structure

Use GitHub issues for planning and tracking work.

Recommended hierarchy:

- `Epic`: a large initiative with multiple related tasks
- `Task`: a concrete implementation step

Do not duplicate the issue type in both the title and a label.

Preferred:

- Title: `Admin Dashboard`
- Label: `type:epic`

Avoid:

- Title: `[Epic] Admin Dashboard`
- Label: `type:epic`

## Labels

Labels should describe the issue, not repeat the exact Git branch or commit syntax.

Recommended type labels:

- `type:epic`: a large initiative with multiple related tasks
- `type:task`: a concrete implementation task

Recommended work labels:

- `work:setup`: repository, tooling, or environment setup
- `work:docs`: documentation work
- `work:refactor`: internal code improvements without a new feature
- `work:bug`: incorrect or broken behavior that needs to be fixed

Label rules:

- use at most one `type:*` label on one issue
- use `type:epic` or `type:task` only for work level
- optionally use one `work:*` label to describe the nature of the work
- do not combine `type:epic` with `type:task`
- do not combine multiple `work:*` labels on the same issue
- some small issues can exist without a `type:*` label if they do not need hierarchy

Valid examples:

- `type:epic` + `work:setup`
- `type:task` + `work:setup`
- `type:task` + `work:docs`
- `type:task` + `work:refactor`
- `work:bug`

Avoid:

- `type:epic` + `type:task`
- `work:setup` + `work:docs`
- `work:setup` + `work:refactor`
- `work:docs` + `work:refactor`
- two or more `work:*` labels on one issue

Recommended area labels:

- `area:repo`: repository structure and tooling
- `area:frontend`: React, Vite, client-side work
- `area:backend`: Node.js, Express, GraphQL, API work
- `area:database`: PostgreSQL and persistence
- `area:devops`: Docker, infrastructure, deployment, hosting, environment delivery, automation, and pipeline work

Recommended priority labels:

- `priority:high`: important work that should be handled soon
- `priority:medium`: normal priority planned work
- `priority:low`: nice-to-have or non-urgent work

Recommended status labels:

- `status:needs-discussion`: requirements or implementation details need clarification before work starts
- `status:blocked`: work cannot continue until an external dependency or decision is resolved
- `status:in-progress`: work is currently being implemented or actively updated
- `status:done`: work has been completed and no further changes are expected

Recommended extra label:

- `good first issue`: a small, well-scoped task that is easy to start with

Use issue titles to describe the work clearly and let labels describe classification.

Example label combinations:

- `Project Foundation`
  - `type:epic`
  - `work:setup`
  - `area:repo`
  - `priority:high`

- `Set up Husky pre-commit branch name validation`
  - `type:task`
  - `work:setup`
  - `area:repo`
  - `priority:high`

- `Document repository workflow`
  - `type:task`
  - `work:docs`
  - `area:repo`
  - `priority:medium`

- `Fix dashboard layout overflow on mobile`
  - `work:bug`
  - `area:frontend`
  - `priority:high`

## Branch Naming

Branch names should be short, readable, and consistent.

Format:

`<type>/<issue-number>-<short-slug>`

If there is no issue yet, this is also allowed:

`<type>/<short-slug>`

Allowed branch types:

- `feat`: new product functionality
- `fix`: bug fixes
- `docs`: documentation changes
- `refactor`: code restructuring without feature or bug changes
- `test`: test creation or updates
- `ci`: CI workflow or automation changes
- `chore`: repository setup, tooling, maintenance, config

Examples:

- `feat/11-admin-dashboard`
- `feat/add-user`
- `fix/24-login-validation`
- `docs/7-project-structure`
- `refactor/graphql-context`
- `test/auth-service`
- `ci/github-actions`
- `chore/setup-git-hooks`

Guidelines:

- use lowercase only
- use `kebab-case` for the slug
- keep the slug short and descriptive
- prefer including the issue number when the issue already exists

Type guide:

- `feat`: pages, endpoints, UI flows, user-facing features
- `fix`: broken behavior, regressions, incorrect validation, runtime errors
- `docs`: markdown files, architecture notes, setup guides
- `refactor`: file moves, code cleanup, extraction, internal design changes
- `test`: unit tests, integration tests, test helpers
- `ci`: GitHub Actions workflows, CI checks, automation scripts for pipelines
- `chore`: ESLint, Prettier, Husky, package updates, gitignore, repo bootstrap

## Commit Naming

Commits follow Conventional Commits.

Format:

`type(scope): message`

Examples:

- `feat(admin): add dashboard layout`
- `fix(auth): handle expired token`
- `docs(workflow): add issue and branch naming guide`
- `refactor(api): extract graphql client`
- `test(user): add service unit tests`
- `ci(actions): add pull request checks`
- `chore(hooks): add branch name validation`

Commit type meanings:

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation only
- `refactor`: internal code change without new behavior
- `test`: tests only
- `ci`: CI workflow or pipeline changes
- `chore`: tooling, setup, maintenance, dependencies, config

Scope guide:

- use a small technical area such as `admin`, `auth`, `api`, `hooks`, `workflow`, `actions`
- keep scope optional if it adds no value

Message guide:

- start with a verb
- describe the result, not the process
- keep it short

Preferred:

- `feat(admin): add dashboard layout`
- `chore(repo): initialize project structure`

Avoid:

- `feat(admin): working on dashboard`
- `fix: stuff`

## Pull Request Flow

The repository uses pull requests to merge work into `main`.

Recommended flow:

1. Create or refine the GitHub issue.
2. Create a branch from `main`.
3. Make focused commits using Conventional Commits.
4. Push the branch.
5. Open a pull request.
6. Add the relevant labels before review.
7. Use squash merge after review or self-review.

Pull request title:

- prefer the same style as the final squash commit
- example: `feat(admin): add dashboard layout`

Pull request checklist:

- linked to an issue when possible
- labels match the work area and priority
- branch name follows the convention
- commits are clear and focused
- documentation is updated when behavior or process changed
- CI checks pass

## Issue, PR, And Commit Roles

Use issues, pull requests, and commits for different purposes.

What goes where:

- `Issue`: describes the goal, context, and requirements
- `Pull request`: describes what was actually changed and how it was tested
- `Commit`: describes one technical step in the implementation
- `PR comments`: capture additional discussion, decisions, or review notes

Issue content should answer:

- what needs to be done
- why the change is needed
- what requirements or constraints exist

Pull request content should answer:

- what was implemented
- what the final result includes
- how the change was tested
- which issue is linked or closed

Commit messages should:

- stay short and technical
- describe one implementation step
- not replace the PR summary

Recommended rule:

- use the issue for planning
- use the PR for the result summary
- use commits for technical history
- use comments only for extra context or review discussion

When a pull request should have a description:

- almost always
- even a small PR should include a short summary and testing notes

Suggested PR description format:

```md
## Summary
- short result 1
- short result 2

## Testing
- tested valid case
- tested invalid case

Closes #<issue-number>
```

Example:

```md
## Summary
- add commit message validation with commitlint
- add husky commit-msg hook
- improve feedback for invalid commit messages

## Testing
- tested invalid commit message: `added stuff`
- tested valid commit message: `chore(hooks): add commit message validation`

Closes #6
```

Do not use:

- commit messages as progress updates
- the issue as a change log of every small implementation step
- an empty PR description when the change has non-trivial behavior

## Testing

The repository splits tests by runtime and purpose so they can be run independently or together during development and review.

Frontend tests live in `apps/web` and use `Vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`. They are focused on React component and UI behavior checks, and the local command is `npm run test:web`.

Backend tests live in `apps/api` and use `Vitest` together with `supertest`. They cover API behavior through HTTP and GraphQL endpoints, and the local command is `npm run test:api`.

End-to-end tests live in `e2e/playwright` and use `Playwright`. They validate the application flow from the browser, and the local command is `npm run test:e2e`.

Useful test commands:

- `npm run test:web`
- `npm run test:api`
- `npm run test:e2e`

When changing behavior that affects multiple parts of the system, update the relevant test layer first and make sure the matching command passes before opening or merging a pull request.

## Local Hooks

Local hooks provide fast feedback before code reaches GitHub.

Execution flow:

1. `husky` manages local Git hooks in the repository.
2. When `git commit` runs, `husky` executes `.husky/pre-commit`.
3. `.husky/pre-commit` runs `scripts/git/validate-branch-name.sh`.
4. If the branch name is valid, Git continues to the commit message step.
5. Then `husky` executes `.husky/commit-msg`.
6. `.husky/commit-msg` runs `scripts/git/validate-commit-message.sh`.
7. `scripts/git/validate-commit-message.sh` uses `commitlint` to validate the commit message format.

Responsibilities:

- `husky`: connects Git hooks to the repository
- `.husky/pre-commit`: starts branch validation before the commit is created
- `.husky/commit-msg`: starts commit message validation
- `scripts/git/validate-branch-name.sh`: checks whether the current branch follows the branch naming convention
- `scripts/git/validate-commit-message.sh`: shows user-friendly feedback and runs commit message validation
- `commitlint`: validates the Conventional Commit structure and allowed commit types

Validation order:

- branch validation runs first
- if the branch name is invalid, the commit stops before commit message validation
- if the branch name is valid, commit message validation runs next
- if the commit message is invalid, the commit is rejected with guidance and examples

Current branch validation behavior:

- allows: `feat/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`, `ci/*`, `chore/*`
- allows optional issue prefix, for example `feat/11-admin-dashboard`
- shows a short explanation, valid examples, and a rename command when invalid

Current commit validation behavior:

- uses Conventional Commits
- allows commit types: `feat`, `fix`, `docs`, `refactor`, `test`, `ci`, `chore`
- supports both `type(scope): message` and `type: message`
- shows a short explanation and valid examples when invalid

Practical examples:

- valid branch: `chore/6-commit-message-validation`
- invalid branch: `add-user`
- valid commit: `chore(hooks): add commit message validation`
- valid commit: `docs: update workflow guide`
- invalid commit: `added stuff`

This is local developer tooling, not CI.

If the workflow changes later, update this document and the related scripts together.

## CI / CD Overview

CI and CD are related but different.

- `CI` checks code quality and correctness
- `CD` handles deployment

CI examples:

- lint
- tests
- build
- branch or PR validation

CD examples:

- preview deployment
- staging deployment
- production deployment

Recommended repository direction:

- keep CI and CD in separate GitHub Actions workflow files
- use local hooks for fast feedback
- use GitHub Actions as the final enforcement layer

## Docker And Compose

The repository uses two Compose stacks: a development stack and a production-like stack.

The current layout is:

```txt
my-app
├── web
│   ├── dev.Dockerfile
│   └── Dockerfile
├── api
│   ├── dev.Dockerfile
│   └── Dockerfile
├── nginx.dev.conf
├── nginx.conf
├── docker-compose.dev.yml
└── docker-compose.yml
```

Basic Compose commands:

- start dev stack: `docker compose -f docker-compose.dev.yml up --build`
- start production-like stack: `docker compose -f docker-compose.yml up --build`
- stop dev stack: `docker compose -f docker-compose.dev.yml down`
- stop production-like stack: `docker compose -f docker-compose.yml down`

Production-like mode uses `docker-compose.yml` and exposes only nginx on `8081`. The web image is built into a static nginx container, the API runs on `3001` inside the network, and PostgreSQL uses the bind mount `./data/docker/prod/postgres -> /var/lib/postgresql/data`.

Development mode uses `docker-compose.dev.yml` and exposes nginx on `8080`, Vite on `5173`, the API on `3001`, and PostgreSQL on `5432`. The web and API containers run with their dev Dockerfiles, and `nginx.dev.conf` proxies browser traffic to the live dev services.

Common environment values are stored in `.env` and `.env.example`. The repo also keeps separate dev and production-like database credentials and connection strings so both stacks can run independently.

Useful verification commands:

- stop and remove the dev stack: `docker compose -f docker-compose.dev.yml down -v --rmi local --remove-orphans`
- stop and remove the production-like stack: `docker compose -f docker-compose.yml down -v --rmi local --remove-orphans`
- clean build cache: `docker builder prune -f`
- start production-like mode: `docker compose -f docker-compose.yml up --build`
- start development mode: `docker compose -f docker-compose.dev.yml up --build`

Production-like access:

- `http://localhost:8081/api/health`
- `http://localhost:5173/` is not exposed
- `http://localhost:3001/` is not exposed
- `http://localhost:3001/api/health` is not exposed

Development access:

- `http://localhost:8080/`
- `http://localhost:5173/`
- `http://localhost:3001/api/health`

Database verification:

- dev PostgreSQL shell: `docker compose -f docker-compose.dev.yml exec postgres psql -U prep_tracker_dev -d prep_tracker_dev`
- production-like PostgreSQL shell: `docker compose -f docker-compose.yml exec postgres psql -U prep_tracker -d prep_tracker`

Nginx verification:

- `docker compose -f docker-compose.dev.yml exec nginx nginx -t`
- `docker compose -f docker-compose.yml exec nginx nginx -t`

Persistent database data:

PostgreSQL data is stored with bind mounts so local data survives container rebuilds and restarts.

```txt
data/
└── docker/
    ├── dev/
    │   └── postgres/
    └── prod/
        └── postgres/
```

Mappings:

```txt
dev:
./data/docker/dev/postgres -> /var/lib/postgresql/data

production-like:
./data/docker/prod/postgres -> /var/lib/postgresql/data
```

## Render Setup

The cloud setup is split into separate Render services and environment groups so each service receives only the values it needs.

Render services:

- `prep-tracker-web`: public frontend service
- `prep-tracker-api`: backend service

Database:

- the API connects to the external Aiven PostgreSQL database
- the database connection is not stored in the repository
- the API reads `DATABASE_URL` from Render environment variables

Environment groups:

- `web-connect`: web service environment variables
- `api-connect`: API service environment variables

Linked values:

- `prep-tracker-web`
  - `VITE_API_BASE_URL=https://prep-tracker-api.onrender.com/api`
- `prep-tracker-api`
  - `DATABASE_URL=postgres://avnadmin:...@pg-12d07f72-mykola-d704.l.aivencloud.com:20476/defaultdb?sslmode=require`
  - `PORT=3001`
  - `CLIENT_ORIGIN=https://prep-tracker-web.onrender.com`

Render UI flow:

1. Create the environment group.
2. Add the service-specific variables to the group or service settings.
3. Link the environment group to the matching Render service.
4. Redeploy the service so the new values take effect.

Render environment variable workflow:

- [Render docs](https://render.com/docs/configure-environment-variables)
- use the Render dashboard for service-level values and linked environment groups
- keep secrets like `DATABASE_URL` out of git
