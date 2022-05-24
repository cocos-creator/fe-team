const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    "rules": {
        // ====> 基础
        "no-console": 0,
        "eqeqeq": 0,
        "camelcase": ['off', {
            properties: "never", // 属性名称 
            ignoreDestructuring: true, // 忽略解构
            ignoreImports: true,  // 忽略导入
            ignoreGlobals: true, // 忽略全局
        }],
        "require-await": 0, // 编辑器有大量只声明了 async 的函数为了表明这是一个异步函数
        "consistent-return": 0, // 编辑器有大量只声明了 async 的函数为了表明这是一个异步函数 所以可能没有返回值
        "space-before-function-paren": ['error', { "anonymous": "always", "named": "never", "asyncArrow": "always" }],

        // ====> https://eslint.vuejs.org/
        "vue/html-closing-bracket-newline": ["error", {
            "singleline": "never",
            "multiline": "never"
        }],
        "vue/max-attributes-per-line": ["error", {
            "singleline": {
                "max": 2
            },
            "multiline": {
                "max": 1
            }
        }],
        "vue/no-unused-components": isProduction ? 2 : 0,

        // ====> https://typescript-eslint.io/rules/#supported-rules
        "@typescript-eslint/no-var-requires": 0, // 编辑器有大量使用 requires 的地方暂时关闭
        "@typescript-eslint/no-explicit-any": 0, // 我们有大量any 以后再去 
        "@typescript-eslint/no-unused-vars": 0, // TODO: 声明未使用确实不允许，但是量太多，后面单独处理
        "@typescript-eslint/no-empty-function": 0, // TODO: 不允许空函数，量太大，后期处理
        "@typescript-eslint/ban-ts-comment": 0, // @ts-ignore 很多地方在用，暂时不能删除
        "@typescript-eslint/no-this-alias": 0, // 编辑器到处都是 const that = this; 后面立案处理
        "@typescript-eslint/explicit-module-boundary-types": 0, // 公共方法的返回类型
        "@typescript-eslint/ban-types": 0, // 是否直接使用 Function 等当作 type
        "@typescript-eslint/triple-slash-reference": 0, // ts 三斜线的指令
        "@typescript-eslint/no-namespace": 1, // 有一些工作量，先给警告
    }
};

