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
      'vue/block-order': [
        'error',
        {
          order: ['template', 'script', 'style'],
        },
      ],
      'vue/component-name-in-template-casing': [
        'error',
        'kebab-case',
        {
          registeredComponentsOnly: true,
          ignores: [],
        },
      ],
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
)
