export default [
  {
    ignores: [
      'dist', 
      '.eslintrc.cjs', 
      'node_modules',
      'src/**/*.ts',
      'src/**/*.tsx',
      'tailwind.config.ts',
      'vite.config.ts',
      'postcss.config.js',
      'tsconfig.json',
      'tsconfig.node.json'
    ],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        console: true,
        process: true,
        Buffer: true,
        __dirname: true,
        __filename: true,
        module: true,
        require: true,
        exports: true,
        global: true,
        window: true,
        document: true,
        navigator: true,
        localStorage: true,
        sessionStorage: true,
        fetch: true,
        URL: true,
        URLSearchParams: true,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]
