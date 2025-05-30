import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        name: '引擎自定义规则',
        rules: {
            camelcase: 'off', // underscores may come in handy in some cases
            eqeqeq: 'warn', // important check missing from recommended
            'keyword-spacing': 'warn', // we require this explicitly
            'no-multi-spaces': 'off', // useful for manually align some expression across lines
            'prefer-rest-params': 'off', // we need ES5 to be fast too
            'prefer-spread': 'off', // we need ES5 to be fast too
            'space-before-function-paren': ['warn', 'always'], // we require this explicitly
            radix: 'off', // we sometimes do not need to pass a second parameter
            // allow underscores, we still widely use pre - dangle naming in our naming convention
            // e.g.private properties, private functions, module scope shared variables etc.
            'no-underscore-dangle': 'off',
            quotes: ['warn', 'single', { allowTemplateLiterals: true }], // force single, but allow template literal
            'no-else-return': 'off', // else -return is a common pattern which clearly expresses the control flow
            'no-unused-expressions': 'off', // taken over by '@typescript-eslint/no-unused-expressions'

            // AIRBNB - SPECIFIC RULE OVERRIDES #####

            'class-methods-use-this': 'off', // so empty functions could work
            'guard-for-in': 'off', // for-in is a efficient choice for plain objects
            'import/export': 'off', // so export declare namespace could work
            'import/extensions': 'off', // typescript doesn't support this
            'import/no-unresolved': 'off', // TODO: fix internal modules
            'import/prefer-default-export': 'off', // prefer named exports
            indent: 'off', // use @typescript-eslint / indent instead for better compatibility

            'lines-between-class-members': 'off', // be more lenient on member declarations
            'max-classes-per-file': 'off', // helper classes are common
            'max-len': ['warn', 150], // more lenient on max length per line
            'no-console': 'off', // this is just too much work, cc."warn", is still too much pain to use
            'no-plusplus': 'off', // allow increment / decrement operators
            'no-continue': 'off', // allow unlabeled continues
            'no-mixed-operators': 'off', // this is just cumbersome
            'no-multi-assign': 'off', // it is handy sometimes
            'no-nested-ternary': 'off', // it is handy sometimes
            'no-param-reassign': 'off', // the output object is passed as parameters all the time
            'no-restricted-syntax': 'off', // for-in is a efficient choice for plain objects
            'no-return-assign': 'off', // it is handy sometimes
            'no-shadow': 'off', // TODO: this throws false - positives ?
            'no-sequences': 'off', // it is handy sometimes
            'no-bitwise': 'off', // we use this extensively
            'no-use-before-define': 'off', // just too much work
            'no-useless-constructor': 'off', // gives false - positives for empty constructor with parameter properties
            'object-curly-newline': 'off', // we want manual control over this
            'one-var-declaration-per-line': 'off', // auto - fix has order issues with `one-var`
            'prefer-destructuring': 'off', // auto - fix is not smart enough to merge different instances
            'linebreak-style': 'off', // we don't enforce this on everyone's dev environment for now
            'spaced-comment': 'off', // for license declarations

            // TYPESCRIPT - SPECIFIC RULE OVERRIDES #####

            '@typescript-eslint/indent': [
                'warn',
                4,
                {
                    SwitchCase: 0,
                },
            ],
            '@typescript-eslint/no-unused-expressions': 'warn',

            // TODO: this is just too much work
            '@typescript-eslint/explicit-module-boundary-types': 'off',

            // TODO: sadly we still rely heavily on legacyCC
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',

            '@typescript-eslint/unbound-method': 'off', // we exploit prototype methods sometimes to acheive better performace
            '@typescript-eslint/no-explicit-any': 'off', // still relevant for some heavily templated usages
            '@typescript-eslint/no-empty-function': 'off', // may become useful in some parent classes
            '@typescript-eslint/no-unused-vars': 'off', // may become useful in some parent classes
            '@typescript-eslint/no-non-null-assertion': 'off', // sometimes we just know better than the compiler
            '@typescript-eslint/no-namespace': [
                'warn',
                {
                    // we need to declare static properties
                    allowDeclarations: true,
                    allowDefinitionFiles: true,
                },
            ],
            '@typescript-eslint/restrict-template-expressions': [
                'warn',
                {
                    // concatenations of different types are common, e.g.hash calculations
                    allowNumber: true,
                    allowBoolean: true,
                },
            ],
        },
    },
]);
