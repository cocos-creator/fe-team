const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    rules: {
        // Eslint@8.53.0 开始废弃基础的格式配置 https://eslint.org/blog/2023/10/deprecating-formatting-rules/ 
        // 基础的格式都用 prettier 

        // ====> 基础
        'no-console': 0,
        'no-empty': 0, // 编辑器很多 try catch 的 catch 是空的
        'no-useless-escape': 1, // 太多了，改不动
        'no-async-promise-executor': 1, // new Promise(async (resolve) => {}) 不允许 async ，但是太多地方用了
        'no-case-declarations': 1, // case 里面不要定义变量，项目很地方这样用，先给警告
        'no-unreachable': 1, // return null 给警告
        'eqeqeq': 0,
        'prefer-const': 1, // 推荐使用 const 但是目前不强制
        'camelcase': [
            'off',
            {
                properties: 'never', // 属性名称
                ignoreDestructuring: true, // 忽略解构
                ignoreImports: true, // 忽略导入
                ignoreGlobals: true, // 忽略全局
            },
        ],
        'require-await': 0, // 编辑器有大量只声明了 async 的函数为了表明这是一个异步函数
        'consistent-return': 0, // 编辑器有大量只声明了 async 的函数为了表明这是一个异步函数 所以可能没有返回值
       
        // ====> https://eslint.vuejs.org/
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: {
                    max: 2,
                },
                multiline: {
                    max: 1,
                },
            },
        ],
        'vue/no-unused-components': isProduction ? 2 : 0,
        'vue/html-indent': [
            'error',
            4,
            {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            },
        ],
        'vue/html-self-closing': 0,

        // ====> https://typescript-eslint.io/rules/#supported-rules
        '@typescript-eslint/type-annotation-spacing': ['warn', { after: true }], // type 前面要有空格
        '@typescript-eslint/no-var-requires': 0, // 编辑器有大量使用 requires 的地方暂时关闭
        '@typescript-eslint/no-explicit-any': 0, // 我们有大量any 以后再去
        '@typescript-eslint/no-unused-vars': 0, // TODO: 声明未使用确实不允许，但是量太多，后面单独处理
        '@typescript-eslint/no-empty-function': 0, // TODO: 不允许空函数，量太大，后期处理
        '@typescript-eslint/ban-ts-comment': 0, // @ts-ignore 很多地方在用，暂时不能删除
        '@typescript-eslint/no-this-alias': 0, // 编辑器到处都是 const that = this; 后面立案处理
        '@typescript-eslint/explicit-module-boundary-types': 0, // 公共方法的返回类型
        '@typescript-eslint/ban-types': 0, // 是否直接使用 Function 等当作 type
        '@typescript-eslint/triple-slash-reference': 0, // ts 三斜线的指令
        '@typescript-eslint/no-namespace': 1, // 有一些工作量，先给警告
        '@typescript-eslint/no-non-null-asserted-optional-chain': 1, // 使用可选链的时候允许抛出 undefined
        '@typescript-eslint/adjacent-overload-signatures': 0,
        '@typescript-eslint/no-empty-interface': 1,
        '@typescript-eslint/comma-dangle': [
            'error',
            {
                arrays: 'always-multiline', // 只有多行的情况下，才需要末尾的逗号，这样的目的是减少 commit 的变更行数
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'only-multiline',
                enums: 'always-multiline',
                tuples: 'only-multiline',
                generics: 'only-multiline',
            },
        ],
        '@typescript-eslint/quotes': [
            'error',
            'single',
            {
                avoidEscape: false,
                allowTemplateLiterals: true,
            },
        ],
    },
    overrides: [
        {
            files: ['*.ts', '*.mts', '*.cts', '*.tsx', '*.vue'],
            rules: {
                'no-undef': 'off', // https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
            },
        },
    ],
};
