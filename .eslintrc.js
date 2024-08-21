module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  plugins: ['jest'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/test_util/**'],
      plugins: ['jest'],
      extends: ['plugin:jest/recommended'],
      rules: {
        'prettier/prettier': 'error',
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
      },
    },
    {
      files: ['**/*.mjs'],
      rules: {
        'import/extensions': ['error', 'always'],
      },
    },
    {
      files: ['tapi/tools/**'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/test_util/**', '**/*.test.js', '**/*.spec.js'] }],
    'no-plusplus': 'off',
  },
  ignorePatterns: ['k6/**'],
};
