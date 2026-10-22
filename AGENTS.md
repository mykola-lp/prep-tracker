# AGENTS.md

This repository uses `AGENTS.md` as the shared instruction file for coding agents.
Keep this file short, current, and focused on repo-wide rules. Put longer process
notes in `docs/`.

## Project Overview

`prep-tracker` is a small monorepo with:

- `apps/web`: React + Vite frontend
- `apps/api`: Express + GraphQL backend
- `e2e/playwright`: browser-level end-to-end tests
- `docs/workflow.md`: branching, commit, issue, and delivery workflow

## Source Of Truth

Prefer these files in this order:

1. `package.json` for commands
2. `docs/workflow.md` for repo process and collaboration rules
3. `AGENTS.md` for agent behavior and repo-wide constraints
4. `CLAUDE.md` for Claude Code adapter instructions
5. `README.md` when it exists for onboarding

Do not duplicate the same rule in multiple places unless a tool requires a
tool-specific adapter.

## Commands

Use the root scripts from `package.json`:

- install dependencies: `npm install`
- run both apps: `npm run dev`
- run frontend only: `npm run dev:web`
- run backend only: `npm run dev:api`
- build frontend: `npm run build:web`
- test frontend: `npm run test:web`
- test backend: `npm run test:api`
- run browser tests: `npm run test:e2e`
- check formatting: `npm run format:check`
- fix formatting: `npm run format`
- validate branch name: `npm run check:branch-name`
- validate commit message: `npm run check:commit-message`

## Repo Map

- Frontend code lives in `apps/web/src`
- Backend code lives in `apps/api/src`
- Browser tests live in `e2e/playwright`
- Repository scripts live in `scripts/git`

## Working Rules

- Make the smallest change that solves the task.
- Keep UI work inside the frontend app unless the change clearly belongs in the API.
- Keep API behavior testable through `createApp()` in `apps/api/src/app.js`.
- Prefer updating existing files over adding new abstractions too early.
- If behavior changes, update the nearest tests and any affected docs together.
- Do not introduce new dependencies unless there is a clear payoff.
- Do not rename public scripts or file locations without a strong reason.
- Preserve the current monorepo layout unless the task explicitly requires a move.

## React and JSX Readability

### Formatting

- Follow the repository's Prettier configuration.
- Format changed files with Prettier instead of manually adjusting formatting.
- Prefer readable JSX over unnecessarily long lines.
- Keep multiline JSX attributes consistently formatted.
- Do not add whitespace or line breaks that conflict with Prettier.

### Component Structure

- Give each component one clear responsibility.
- Keep the main page component focused on composing the page's major sections.
- Extract substantial, logically independent sections into named components when doing so improves readability and navigation.
- Keep small, closely related components in the same file when this remains easy to navigate.
- Do not create a separate component or file for every wrapper, heading, or minor markup element.
- Declare React components at module scope, not inside other components.
- Keep static data separate from rendering logic when this makes the component easier to understand.
- Keep related behavior close to the component responsible for that behavior.

### JSX Organization

- Group imports, constants, helper functions, and exported components in a consistent order.
- Separate logically distinct blocks with blank lines.
- Use semantic HTML elements according to their purpose.
- Keep nested JSX indentation consistent.
- Break up large JSX structures into meaningful components rather than relying on excessive comments.
- Avoid deeply nested conditional expressions and unnecessarily complex inline logic.

### Comments

- Use comments to explain non-obvious decisions, constraints, and reasons.
- Use section comments only when they improve navigation through a large file.
- Do not add comments that merely repeat the name or purpose of an obvious element.
- Prefer descriptive component and variable names over explanatory comments.

### Scope and Maintainability

- Preserve existing behavior, routes, authentication, accessibility, and styling contracts during refactoring.
- Avoid unrelated changes.
- Do not introduce unnecessary abstractions or split components without a clear readability benefit.
- After changing JSX, run Prettier, ESLint, and the relevant tests.
- Review the final code for readability and component responsibilities, not only for passing formatters and linters.

## Frontend Conventions

- Use React function components and hooks.
- Keep shared UI styling in `apps/web/src/styles.css` unless a new pattern justifies extraction.
- If a UI change affects loading, error, or empty states, cover that path in a test.

## Frontend Design Guidance

For tasks involving new frontend UI or substantial visual redesigns:

- Use the `frontend-design` skill from `.agents/skills/frontend-design/SKILL.md`.
  Claude Code also has a mirrored copy at
  `.claude/skills/frontend-design/SKILL.md`.
- Consult `docs/references/frontend-aesthetics/prompting_for_frontend_aesthetics.ipynb`
  when planning the visual direction and implementation approach.
- Before implementation, establish a product-specific direction for typography,
  colors, composition, motion, and visual identity.
- Critique the proposed design against the brief and avoid generic AI-generated
  patterns unless they are justified by the actual product requirements.
- Treat reference materials as guidance, not templates to copy.
- Keep changes scoped to the requested UI. Do not refactor global styling
  architecture unless the task explicitly requires it.
- Follow `docs/frontend/css-conventions.md` for CSS architecture,
  class naming, property ordering, and layout decisions.
- Use CUBE CSS principles; do not use BEM naming.
- Run `npm run lint:css` when changing frontend styles.

## Backend Conventions

- Keep the API entrypoint small and defer logic to helpers where possible.
- Preserve the existing `/api/health` and `/api/graphql` contract unless the task is specifically about changing them.
- If database behavior changes, make sure the non-configured and error paths still behave safely.

## Testing Guidance

- Run the narrowest relevant test set first.
- Frontend changes usually need `npm run test:web`.
- Backend changes usually need `npm run test:api`.
- Changes that affect the browser shell, routing, or cross-app integration should also run `npm run test:e2e`.
- Keep tests deterministic and stub external network calls.

## Configuration And Safety

- Never commit secrets or `.env` files.
- Treat `DATABASE_URL`, `CLIENT_ORIGIN`, `PORT`, and `VITE_API_BASE_URL` as environment-driven configuration.
- Local dev defaults are `http://localhost:5173` for the web app and `http://localhost:3001` for the API.
- If a change adds or removes an environment variable, document it in the relevant repo docs.

## Workflow Notes

- Branch naming, commit format, issue labels, and delivery flow are defined in `docs/workflow.md`.
- Keep workflow rules in that file instead of repeating them here.
- When in doubt, prefer clarity, small diffs, and explicit tests.
