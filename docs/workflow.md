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

## Local Hooks

Local hooks provide fast feedback before code reaches GitHub.

Current local automation:

- `husky`: manages Git hooks in the repository
- `pre-commit`: runs local checks before each commit
- `scripts/git/validate-branch-name.sh`: validates branch naming

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
