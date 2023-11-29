module.exports = {
    root: true,
    env: {
        browser: true,
        commonjs: true,
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended', // eslint 官方
        'plugin:vue/vue3-recommended', // vue 官方
        'plugin:@typescript-eslint/recommended', // ts 官方
        '@cocos-fe/eslint-config/editor', // cocos 官方
    ],
    globals: {
        chrome: 'readonly',
        Editor: 'readonly',
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 6,
        sourceType: 'module',
        ecmaFeatures: {
            modules: true,
        },
    },
    rules: {
        // 原则上我们各个项目不应该单独定制 rules，想加什么规则请和团队确认。
        semi: 0,
    },
};
