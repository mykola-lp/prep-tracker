# CSS Conventions

## Methodology

Use CUBE CSS as the project's CSS methodology.

Do not use BEM naming conventions.

- Composition: control layout and relationships between elements.
- Utility: provide small, reusable layout and styling helpers.
- Block: style individual UI components.
- Exception: express contextual variations through appropriate state attributes.

Follow the official methodology: https://cube.fyi/

## Stylesheet Organization

- Keep component-specific styles in CSS Modules.
- Keep global styles, design tokens, resets, and shared utilities in the existing global stylesheet where appropriate.
- Keep selectors close to the component or concern they describe.
- Avoid unnecessary selector nesting and excessive specificity.
- Organize large CSS files into clearly named sections.
- Order sections according to their place in the page or component structure.

## Class Naming

- Use descriptive, semantic class names.
- Follow the existing CSS Modules naming convention.
- Do not use BEM element or modifier patterns such as `block__element` or `block--modifier`.
- Prefer reusable composition and utility classes when they express a genuinely shared responsibility.
- Avoid creating one-off utility classes for every declaration.

## Declaration Order and Formatting

- Follow the configured Recess property order.
- Separate property groups with blank lines.
- Let Stylelint validate property ordering.
- Let Prettier handle consistent code formatting.
- Group CSS custom properties by purpose.
- Use comments for meaningful sections and non-obvious implementation
  decisions, not to explain every individual property.

## Layout

- Prefer Flexbox for one-dimensional layouts.
- Prefer Grid when the layout requires coordinated rows and columns.
- Use `inline-flex` only when the container needs inline formatting behavior in its parent context.
- Prefer `gap` for spacing between flex and grid children.
- Prefer logical properties such as `margin-inline` and `padding-block` where appropriate.
- Avoid using positioning as a substitute for normal layout.

## Responsive Design and Accessibility

- Consider narrow viewports when implementing layout.
- Use media queries only where the design needs them.
- Respect `prefers-reduced-motion`.
- Preserve semantic HTML, visible focus states, and readable contrast.

## Validation

- Run `npm run lint:css` to check CSS.
- Run `npm run format:check` to check formatting.
- Do not automatically reformat unrelated CSS files as part of an unrelated task.
