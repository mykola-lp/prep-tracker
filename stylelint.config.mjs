import propertyGroups from 'stylelint-config-recess-order/groups';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],

  plugins: ['stylelint-order'],

  ignoreFiles: ['**/node_modules/**', '**/dist/**'],

  rules: {
    'declaration-empty-line-before': null,

    // CSS Modules use camelCase; global classes use lowercase kebab-case.
    // This avoids BEM element and modifier separators.
    'selector-class-pattern': '^(?:[a-z][a-zA-Z0-9]*|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$',

    'order/properties-order': propertyGroups.map((group) => ({
      ...group,
      emptyLineBefore: 'always',
      noEmptyLineBetween: true,
    })),
  },
};
