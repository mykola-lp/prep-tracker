# Workflow

This document describes the working conventions for the repository: issue structure, labels, branch naming, commit naming, pull requests, and delivery flow.

## Repository Conventions

Source of truth order:

- use `package.json` for commands
- use `AGENTS.md` for agent behavior and repository rules
- use `docs/` for workflow and deeper context
- use `README.md` for quick onboarding

Consistency rules:

- do not describe the same command differently in multiple files
- do not repeat policy text in both `README.md` and `AGENTS.md`
- keep `AGENTS.md` short and point to detailed docs when needed
- update the owning file first when a shared rule changes
- prefer one canonical source over several manually maintained copies

## Repo Map

Use this section first when you need to understand where a change belongs.

Core areas:

- `apps/web`: React frontend
- `apps/api`: Express and GraphQL backend
- `e2e/playwright`: end-to-end tests
- `docker-compose.dev.yml`: development stack
- `docker-compose.yml`: production-like stack
- `.github/workflows`: CI and deployment automation
- `docs/`: repository documentation

Local environment: [`draft`] remove or add better explanation

- `apps/web` runs the Vite frontend
- `apps/api` runs the Express and GraphQL backend
- tests are split by runtime and can run independently
- Docker provides both dev and production-like stacks

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

## Issue Structure

Use GitHub issues to track work.

- `Epic`: a larger initiative
- `Task`: a single implementation step

Keep the title and label focused on different things.

Preferred:

- Title: `Admin Dashboard`
- Label: `type:epic`

Avoid:

- Title: `[Epic] Admin Dashboard`
- Label: `type:epic`

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

## Issue, PR, and Commit Roles [`final`]

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
- use comments only for extra context or review

## Issue description format [`draft`] add rules

Use this format to keep issues clear about the goal, context, and constraints.

Recommended issue body (epic):

```md
## Summary

Short description of the goal in one or two sentences.

## Context

Explain why this issue exists and what problem it solves.

## Scope

- what is included
- what is not included
- any important constraints

## Requirements

- concrete conditions that must be true
- technical or product constraints

## Acceptance Criteria

- measurable outcome 1
- measurable outcome 2
- measurable outcome 3

## Notes

Optional details, links, or follow-up context.
```

Example:

```md
## Summary

Build the first production-ready version of Prep Tracker as the main product foundation.

## Context

Interview preparation is often split across notes, bookmarks, and temporary todo lists.
This epic defines the initial product scope for organizing topics, questions, notes, deadlines, and progress in one place.

## Scope

- authentication and user-specific data access
- topic management
- question tracking under topics
- notes
- progress statuses
- deadlines
- tags and filtering
- dashboard overview

Not included:

- Kubernetes deployment
- public sharing
- multi-user collaboration
- advanced analytics

## Requirements

- the app must support a clear frontend and backend separation
- the data model must support future expansion without a major rewrite
- the main flows must be testable

## Acceptance Criteria

- a user can sign in and work only with their own data
- a user can create and manage study topics
- a user can add questions and notes to a topic
- a user can mark progress and deadlines
- a user can filter items and view a dashboard summary

## Notes

Implementation details should be split into separate task issues.
```

Recommended issue body (task):

```md
**Goal:**

Describe the main purpose of this feature and what user problem it solves.

**What to do:**

List the functional requirements or tasks that must be implemented.

**Technologies:**

List technologies, libraries, databases, frameworks, or tools expected for implementation.

**Done when:**

Define acceptance criteria.
```

Example:

```md
**Goal:** help users organize prep content and find related items quickly.

**What to do:**

- create tags that can be assigned to topics, questions, or notes
- support adding and removing tags from items
- support listing items by tag
- add filtering by tag and by content state
- keep tag ownership user-specific
- ensure the tag model can grow without complicating the schema too early

**Technologies:**

- GraphQL queries and mutations
- Sequelize many-to-many relations
- PostgreSQL
- Vitest
- Supertest

**Done when:**

- users can create and assign tags
- users can filter content by tag
- tag data stays isolated per user
- the implementation supports future search or category features
```

## PR Description Format [`needs-review`]

Use this format to keep the PR description short, readable, and focused on the result. It should explain what changed, how it was tested, and which issue it relates to.

```md
## What changed

- short result 1
- short result 2

## Why

Short reason for the change.

## How tested

- tested valid case
- tested invalid case

Closes #<issue-number>
```

Example:

```md
## What changed

- add commit message validation with commitlint
- add husky commit-msg hook
- improve feedback for invalid commit messages

## Why

To make commit message validation automatic and easier to understand when it fails.

## How tested

- tested invalid commit message: `added stuff`
- tested valid commit message: `chore(hooks): add commit message validation`

Closes #6
```

## Pull Request Flow [`final`]

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

- prefer the same style as the final squash task/issue title

Example: `Add dashboard layout` or `Dashboard layout`

Pull request checklist:

- linked to an issue when possible
- labels match the work area and priority
- branch name follows the convention
- commits are clear and focused
- documentation is updated when behavior or process changed
- CI checks pass

## Testing [`draft`] re-write

The repository splits tests by runtime and purpose so they can be run independently or together during development and review.

Frontend tests live in `apps/web` and use `Vitest`, `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom`. They are focused on React component and UI behavior checks, and the local command is `npm run test:web`.

Backend tests live in `apps/api` and use `Vitest` together with `supertest`. They cover API behavior through HTTP and GraphQL endpoints, and the local command is `npm run test:api`.

End-to-end tests live in `e2e/playwright` and use `Playwright`. They validate the application flow from the browser, and the local command is `npm run test:e2e`.

Useful test commands:

- `npm run test:web`
- `npm run test:api`
- `npm run test:e2e`

When changing behavior that affects multiple parts of the system, update the relevant test layer first and make sure the matching command passes before opening or merging a pull request.

## Local Hooks [`needs-review`] && code refactor

Local hooks provide fast feedback before code reaches GitHub.

Execution flow:

1. `husky` manages local Git hooks in the repository.
2. When `git commit` runs, `husky` executes `.husky/pre-commit`.
3. `.husky/pre-commit` runs `scripts/git/validate-branch-name.sh`.
4. If the branch name is valid, `.husky/pre-commit` runs `scripts/git/validate-formatting.sh`.
5. If formatting passes, Git continues to the commit message step.
6. Then `husky` executes `.husky/commit-msg`.
7. `.husky/commit-msg` runs `scripts/git/validate-commit-message.sh`.
8. `scripts/git/validate-commit-message.sh` uses `commitlint` to validate the commit message format.

Responsibilities:

- `husky`: connects Git hooks to the repository
- `.husky/pre-commit`: starts branch validation and formatting checks
- `.husky/commit-msg`: starts commit message validation
- `scripts/git/validate-branch-name.sh`: checks whether the current branch follows the branch naming convention
- `scripts/git/validate-formatting.sh`: checks formatting with Prettier and suggests `npm run format`
- `scripts/git/validate-commit-message.sh`: shows user-friendly feedback and runs commit message validation
- `commitlint`: validates the Conventional Commit structure and allowed commit types

Validation order:

- branch validation runs first
- if the branch name is valid, formatting check runs next
- if formatting passes, commit message validation runs last
- if the branch name is invalid, the commit stops before the next checks
- `main` is exempt from branch-name validation

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

## CI / CD Overview [`draft`] re-write

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

## Docker Setup [`final`]

The repository uses two Docker Compose stacks: development and production-like.

Current layout:

```txt
prep-tracker
├── apps
│   ├── web
│   │   ├── dev.Dockerfile
│   │   └── Dockerfile
│   └── api
│       ├── dev.Dockerfile
│       └── Dockerfile
├── nginx.dev.conf
├── nginx.conf
├── docker-compose.dev.yml
└── docker-compose.yml
```

Basic Compose commands:

Development:

- `docker compose -f docker-compose.dev.yml up --build` - start dev stack
- `docker compose -f docker-compose.dev.yml down` - stop dev stack

Production-like:

- `docker compose -f docker-compose.yml up --build` - start production-like stack
- `docker compose -f docker-compose.yml down` - stop production-like stack

Mode overview:

- Development uses `docker-compose.dev.yml`, exposes nginx on `8080`, Vite on `5173`, the API on `3001`, and PostgreSQL on `5432`, and `nginx.dev.conf` proxies browser traffic to the live services.
- Production-like uses `docker-compose.yml`, exposes nginx on `8081`, builds the web app into a static nginx container, and runs the API on `3001` inside the network.
- Development uses the `dev.Dockerfile` files for the frontend and backend.
- Production-like local builds and Render builds use separate production `Dockerfile` files for `web` and `api`.
- Common environment values live in `.env` and `.env.example`.
- Dev and production-like database credentials stay separate so the stacks can run independently.

Development access: [`needs-review`] to check

- `http://localhost:8080/`
- `http://localhost:5173/`
- `http://localhost:3001/api/health`

Production-like access: [`needs-review`] to check

- `http://localhost:8081/api/health`
- `http://localhost:5173/` is not exposed
- `http://localhost:3001/` is not exposed
- `http://localhost:3001/api/health` is not exposed

Database verification:

- `docker compose -f docker-compose.dev.yml exec postgres psql -U prep_tracker_dev -d prep_tracker_dev` - open the dev PostgreSQL shell
- `docker compose -f docker-compose.yml exec postgres psql -U prep_tracker -d prep_tracker` - open the production-like PostgreSQL shell

Nginx verification:

- `docker compose -f docker-compose.dev.yml exec nginx nginx -t` - validate the dev Nginx config
- `docker compose -f docker-compose.yml exec nginx nginx -t` - validate the production-like Nginx config

Other useful commands:

- `docker compose -f docker-compose.dev.yml down -v --rmi local --remove-orphans` - stop and remove the dev stack
- `docker compose -f docker-compose.yml down -v --rmi local --remove-orphans` - stop and remove the production-like stack
- `docker builder prune -f` - clean build cache

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

## Render Setup (production) [`final`]

The cloud setup is split into separate Render services and environment groups so each service receives only the values it needs.

Render services:

- `prep-tracker-web`: frontend service
- `prep-tracker-api`: backend service
- both services build from the production `Dockerfile` for `web` and `api` (separate files)

Database:

- the API connects to the external Aiven PostgreSQL database
- the database connection is not stored in the repository
- the API reads `DATABASE_URL` from Render environment variables

Environment groups:

- `web-connect`: web service environment variables
- `api-connect`: API service environment variables

Linked values:

`prep-tracker-web`

- `VITE_API_BASE_URL=https://prep-tracker-api.onrender.com/api`

`prep-tracker-api`

- `DATABASE_URL=postgres://avnadmin:...@pg-12d07f72-mykola-d704.l.aivencloud.com:20476/defaultdb?sslmode=require`
- `PORT=3001`
- `CLIENT_ORIGIN=https://prep-tracker-web.onrender.com`

## Docs Maintenance [`final`]

This document should stay current when the repository workflow changes.

Update this document when: [`needs-review`] add new items, verify the wording with the final workflow

- branch naming rules change
- commit format rules change
- pull request flow changes
- testing commands change
- local hook behavior changes
- Docker, compose, or Render setup changes

Maintenance rules:

- keep process changes close to the section they affect
- one section = one topic or one task
- do not split related rules across multiple places unless the section becomes too long
- prefer short sentences and lists instead of large paragraphs
- explain what it is and why first
- then explain where it is or how to use it
- prefer updating examples when behavior changes
- avoid repeating the same information across README, AGENTS.md, and docs/
- keep the document readable for humans first, while still making it easy for AI agents to follow
- be clear, friendly, and direct

## Decision Notes [`final`]

Use this section for decisions that are still changing.

Decision states:

- [`draft`] - still being explored or may be split further
- [`needs-review`] - likely correct but not final yet
- [`final`] - settled and ready to follow

You can add a short note after the status to explain what should change.

Examples:

- [`draft`]: split this section into smaller logical parts
- [`needs-review`]: verify the wording with the final workflow
- [`final`]: no further changes needed unless the process changes

Remove temporary notes after the decision becomes [`final`].
