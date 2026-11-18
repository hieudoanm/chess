export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow merge/revert/squash subjects that GitHub and tools generate.
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
    'header-max-length': [2, 'always', 100],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
  },
};
