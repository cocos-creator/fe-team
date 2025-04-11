/** @type {import('stylelint').Config} */
export default {
    configBasedir: './',
    ignoreFiles: ['**/*.js'],
    plugins: [
        'stylelint-prettier',
        'stylelint-order', // 排序插件
    ],
    extends: [
        'stylelint-config-standard',
        'stylelint-prettier/recommended', // 使用 prettier 规则
        'stylelint-config-idiomatic-order', // 排序规则
    ],
    rules: {
        'prettier/prettier': true,
        'selector-type-no-unknown': null, // 我们有自定义元素
        // 禁用无效属性
        'property-no-unknown': [
            true,
            {
                ignoreProperties: ['/^--/'],
            },
        ],
    },
};
