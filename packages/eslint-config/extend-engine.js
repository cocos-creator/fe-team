const base = require('./src/rule-base');
const engine = require('./src/rule-engine');

module.exports = {
    'extends': [
        'eslint:recommended',
    ],
    'rules': {
        ...base.rules,
        ...engine.rules,
    },
};

