import process from 'node:process'
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    rules: {
      'antfu/if-newline': 'off',
    },
    formatters: {
      css: true,
      html: true,
      markdown: 'prettier',
    },
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    ignores: ['tests/*', 'src/app/buildinfo.ts', 'dev-notes.md', 'todo.md'],
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'node/prefer-global/process': 'off',
      'unicorn/prefer-node-protocol': 'off',
      'vue/no-deprecated-slot-attribute': 'off', // necessary to use Ionic slot attributes
      '@typescript-eslint/no-explicit-any': 'off', // from Ionic template
      'style/quote-props': ['error', 'consistent-as-needed', { keywords: true }],
      'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
        },
      ],
      'vue/singleline-html-element-content-newline': ['error', { externalIgnores: ['IonLabel'] }],
    },
  },
  // TypeScript rules
  {
    files: ['src/**/*.ts', 'src/**/*.vue'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // from Ionic template
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  },
)
