const isProduction = process.env.NODE_ENV === 'production';



// "off" or   0 - 关闭规则
// "warn" or  1 - 将规则视为一个警告（不会影响退出码）
// "error" or 2 - 将规则视为一个错误 (退出码为1)

module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "node": true,
        "es2022": true,
        "mocha": true,
        "jest": true
    },
    "globals": {
        "Editor": "readonly"
    },
    "extends": [
        "eslint:recommended",
    ],
    "parserOptions": {
        ecmaVersion: 2021
    },
    "rules": {
        "no-console": 2,
        "vue/html-closing-bracket-newline": ["error", {
            "singleline": "never",
            "multiline": "never"
        }],
        "vue/max-attributes-per-line": ["error", {
            "singleline": 2, // 单行属性允许几个属性
            "multiline": {
                "max": 1,
                "allowFirstLine": true
            }
        }],
        "vue/no-unused-components": isProduction ? 2 : 0,
        "no-dupe-else-if": 'off',
        "no-setter-return": 'off',
        "no-import-assign": 'off',
        "max-len": ['error', {
            "code": 120,
            "ignoreUrls": true,
            "ignoreTrailingComments": true,
            "ignoreComments": true,
            "ignorePattern": 'd="([\\s\\S]*?)"',
            "ignoreTemplateLiterals": true,
        }]
    }
};

