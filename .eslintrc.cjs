module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-console': 'warn',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/no-unused-vars': ['warn'],
    'max-len': ['warn', { code: 100 }],
  },
};
