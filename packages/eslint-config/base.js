const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    "rules": {
        "no-console": isProduction ? ['error', { allow: ["warn", "error"] }] : 0,
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

