import propertyGroups from 'stylelint-config-recess-order/groups';

/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],

  plugins: ['stylelint-order'],

  ignoreFiles: ['**/node_modules/**', '**/dist/**'],

  rules: {
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'theme',
          'source',
          'utility',
          'variant',
          'custom-variant',
          'apply',
          'reference',
          'config',
          'plugin',
        ],
      },
    ],

    'order/properties-order': propertyGroups.map((group) => ({
      ...group,
      emptyLineBefore: 'always',
      noEmptyLineBetween: true,
    })),
  },
};
