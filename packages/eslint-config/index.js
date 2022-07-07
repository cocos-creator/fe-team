module.exports = {
    'env': {
        'browser': true,
        'node': true,
        'es2021': true,
        'vue/setup-compiler-macros': true,
    },
    'globals': {
        'Editor': 'readonly',
    },
    'extends': [
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        './extend-editor.js',
    ],
    'parser': 'vue-eslint-parser',
    'parserOptions': {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    'plugins': [
        'vue',
        '@typescript-eslint',
    ],
};

