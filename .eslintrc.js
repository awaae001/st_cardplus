module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'vue/setup-compiler-macros': true, //  使得 defineProps 和 defineEmits 等宏无需导入
  },
  extends: [
    'plugin:vue/vue3-recommended', // 使用 Vue 3 推荐规则
    'eslint:recommended', // ESLint 推荐的基本规则
    '@vue/typescript/recommended', // Vue 的 TypeScript 推荐规则
    '@vue/prettier', // 集成 Prettier，禁用与 Prettier 冲突的 ESLint 规则
    '@vue/prettier/@typescript-eslint', // 针对 TypeScript 的 Prettier 集成
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  plugins: [
    // 'vue' 和 '@typescript-eslint' 插件通常由 extends 中的配置自动启用
  ],
  rules: {
    // --- ESLint Core Rules (部分常用自定义规则示例) ---
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境警告 console，开发环境关闭
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // 生产环境警告 debugger
    'no-unused-vars': 'off', //  TypeScript 项目中通常由 @typescript-eslint/no-unused-vars 处理

    // --- @typescript-eslint Rules ---
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // 未使用的变量警告 (忽略下划线开头的参数)
    '@typescript-eslint/no-explicit-any': 'warn', // 警告使用 any 类型，但非禁止
    '@typescript-eslint/explicit-module-boundary-types': 'off', //  暂时关闭对导出函数返回值和参数类型的显式要求，可根据项目需求开启
    '@typescript-eslint/no-non-null-assertion': 'warn', // 警告使用非空断言 (!)

    // --- Vue Rules (部分常用自定义规则示例) ---
    'vue/multi-word-component-names': 'off', //  允许单单词组件名 (例如 App.vue, Home.vue), 但通常推荐多单词
    'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false }], // 模板中组件名使用帕斯卡命名
    'vue/html-self-closing': ['error', {
      html: {
        void: 'always', // 对于没有内容的 HTML 元素 (例如 <br>, <img>), 总是自闭合
        normal: 'never', // 对于普通 HTML 元素，从不自闭合
        component: 'always', // 对于 Vue 组件，总是自_闭合
      },
      svg: 'always',
      math: 'always',
    }],
    'vue/max-attributes-per-line': ['warn', {
      singleline: 3,
      multiline: 1,
    }], // 控制每行属性的最大数量
    'vue/no-v-html': 'off', // 允许使用 v-html (若项目确实需要，但需注意XSS风险)
    'vue/require-default-prop': 'warn', // 对于非 required 的 props，建议提供 default 值
    'vue/no-unused-properties': ['warn', { // Vue 组件中未使用的 props, computed properties, data, methods
      groups: ['props', 'data', 'computed', 'methods'],
      deepData: false,
    }],
    'vue/no-mutating-props': 'error', // 禁止直接修改 props

    // --- Prettier (由 @vue/eslint-config-prettier 处理，通常无需在此额外配置) ---
    // 'prettier/prettier': 'error' // 如果没有通过 extends 集成，则需要此行
  },
  globals: {
    // 如果有全局变量，可以在这里定义
    // 例如: myGlobalVar: 'readonly'
  }
};