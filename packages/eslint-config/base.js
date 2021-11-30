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
        }],
        'keyword-spacing': ['warn', {
            'before': true,
            'after': true,
        }],
        'camelcase': ['warn', {
            'properties': 'always',
        }],
        'indent': ['error', 4, { SwitchCase: 1, CallExpression: { arguments: 'off' }, ArrayExpression: 'first' }],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'semi-spacing': ['error', {
            'before': false,
            'after': true,
        }],
        'rest-spread-spacing': ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'curly': 'error',
        'semi': ['error', 'always'],
        'no-multi-spaces': ['error', { ignoreEOLComments: true }],
        'no-whitespace-before-property': 'error',
        'no-tabs': ['error', { allowIndentationTabs: true }],

        'no-unused-vars': 'off',
        'no-empty': ['error', { 'allowEmptyCatch': true }],
        'consistent-return': ['warn', { 'treatUndefinedAsUnspecified': true }],
        'eqeqeq': ['warn', 'always'],
        'max-len': ['warn', {
            'code': 180,
        }],
        'no-undef': 0,
        'no-constant-condition': ['warn', {
            'checkLoops': false,
        }],
        'no-inner-declarations': ['warn'],
        'no-case-declarations': ['warn'],

        // 行尾逗号
        'comma-style': ['error', 'last'],
        'comma-dangle': ['error', {
            'arrays': 'always-multiline',
            'objects': 'always-multiline',
            'imports': 'always-multiline',
            'exports': 'always-multiline',
            'functions': 'only-multiline',
        }],
        'comma-spacing': ['error', {
            'before': false,
            'after': true,
        }],

        // 空格、空行约定
        'unicode-bom': ['warn', 'never'],
        'block-spacing': ['error', 'always'],
        'arrow-spacing': ['error', {
            'before': true,
            'after': true,
        }],
        'space-before-function-paren': ['error', {
            'anonymous': 'never',
            'named': 'never',
            'asyncArrow': 'always',
        }],
        'space-before-blocks': ['error', 'always'],
        'space-infix-ops': ['warn'],
        'space-unary-ops': ['warn', {
            'words': true,
            'nonwords': false,
        }],
        'spaced-comment': ['warn', 'always', {
            'line': {
                'markers': ['/'],
                'exceptions': ['/', '*'],
            },
        },
        ],
        'switch-colon-spacing': ['warn', {
            'before': false,
            'after': true,
        }],
        'eol-last': ['error', 'always'],
        'no-trailing-spaces': ['error', { 'ignoreComments': true }],
        'no-multiple-empty-lines': ["error", { "max": 1, "maxEOF": 1 }],
    }
};

