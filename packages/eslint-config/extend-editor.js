const base = require('./src/rule-base.js');
const editor = require('./src/rule-editor.js');

module.exports = {
    'extends': [
        // "eslint:recommended", 这里很多规则和 @typescript-eslint 是重复的所以弃用。因为我们很多规则必须禁用，要么得写两遍
    ],
    'rules': {
        ...base.rules,
        ...editor.rules,
    },
    overrides: [...editor.overrides],
};

