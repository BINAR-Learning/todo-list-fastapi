module.exports = {
  extends: [
    'eslint:recommended'
  ],
  env: {
    browser: true,
    es2021: true
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  globals: {
    CONFIG: 'readonly',
    Utils: 'readonly',
    StorageUtils: 'readonly',
    ValidationUtils: 'readonly',
    ApiService: 'readonly',
    AuthManager: 'readonly',
    Toast: 'readonly',
    Modal: 'readonly',
    ListCard: 'readonly',
    TaskItem: 'readonly'
  },
  rules: {
    // Code style
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    
    // Best practices
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    
    // ES6+
    'prefer-const': 'error',
    'no-var': 'error',
    'arrow-spacing': 'error',
    'template-curly-spacing': 'error',
    
    // Functions
    'func-style': ['error', 'declaration', { 'allowArrowFunctions': true }],
    'no-unused-expressions': 'error',
    
    // Objects and arrays
    'dot-notation': 'error',
    'no-duplicate-keys': 'error',
    
    // Strings
    'no-multi-str': 'error',
    'no-template-curly-in-string': 'error'
  },
  overrides: [
    {
      files: ['**/*.config.js'],
      rules: {
        'no-unused-vars': 'off'
      }
    }
  ]
};
