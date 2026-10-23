# CSS Conventions

## Styling Architecture

Use **CUBE CSS** as the styling methodology and **CSS Modules** for page- and component-level style isolation.

Do not use BEM naming conventions.

- **Composition:** control layout and relationships between elements.
- **Utility:** provide small, reusable helpers only when a pattern is genuinely shared.
- **Block:** style an individual component or page concern.
- **Exception:** express contextual variations through state attributes or explicit modifier classes that do not use BEM syntax.

Follow the official methodology: https://cube.fyi/

## Stylesheet Ownership

- `apps/web/src/styles/index.css` is the global stylesheet entry point. It should contain imports, not feature-specific styles.
- `apps/web/src/styles/base.css` owns document-level resets and element defaults.
- `apps/web/src/styles/tokens.css` owns design tokens that are intentionally shared across the authenticated application and its shared components.
- A component's stylesheet lives next to its component, such as `AppLayout.module.css` beside `AppLayout.jsx`.
- Page and feature styles remain with their owning feature.
- The marketing landing page owns its visual identity and page-specific tokens in `HomePage.module.css`; do not promote those tokens globally just because they are CSS custom properties.
- Authentication and authenticated application styles should not depend on landing-page selectors.
- Add a shared global utility stylesheet only when repeated, cross-feature composition patterns actually justify one.

## Global Tokens

Promote a value to `tokens.css` when it represents a shared design decision used across multiple components or features, such as a core text color, surface, border, accent, or layout dimension.

Do not promote every repeated declaration automatically. Similar-looking values may represent different semantic roles, and page-specific values can remain local.

Use semantic custom-property names, for example `--color-text`, `--color-surface`, and `--color-accent`, rather than names tied to a single component.

## Class Naming

- Use descriptive, semantic class names.
- In CSS Modules, follow the existing camelCase convention so classes can be referenced as `styles.className`.
- Kebab-case is acceptable for global classes when a global class is genuinely required.
- Do not use BEM element or modifier patterns such as `block__element` or `block--modifier`.
- Prefer a composition or utility class only when it represents a stable, reusable responsibility.
- Avoid one-off utility classes and excessive selector nesting.

## Declaration Order and Formatting

- Follow `stylelint-config-recess-order` for property declaration ordering.
- Let Stylelint validate selectors and property order; do not use file-wide disable comments to bypass these checks.
- Let Prettier handle consistent formatting.
- Group CSS custom properties by purpose.
- Use comments for meaningful sections and non-obvious implementation decisions, not to explain every declaration.

## Layout

- Prefer Flexbox for one-dimensional layouts.
- Prefer Grid when the layout requires coordinated rows and columns.
- Use `inline-flex` only when inline formatting behavior is needed in the parent context.
- Prefer `gap` for spacing between flex and grid children.
- Prefer logical properties such as `margin-inline` and `padding-block` where appropriate.
- Avoid using positioning as a substitute for normal layout.

## Responsive Design and Accessibility

- Consider narrow viewports when implementing layout.
- Add media queries where the design needs them, not automatically at arbitrary breakpoints.
- Respect `prefers-reduced-motion` when a component uses transitions or animation.
- Preserve semantic HTML, visible keyboard focus states, and readable contrast.

## Validation

Run these commands from the repository root:

- `npm run lint:css` to check CSS.
- `npm run lint:css:fix` to apply safe Stylelint fixes.
- `npm run format:check` to check tracked-file formatting.
- `npm run build:web` to verify the frontend production build.
- `npm run test:web` for frontend tests.

Do not reformat unrelated files as part of a narrowly scoped change unless a shared lint/configuration change requires it.
