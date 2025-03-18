import { rulesEditor } from '@cocos-fe/eslint-config';
import pluginJs from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
    { files: ['**/*.{js,mjs,cjs,ts,vue}'] },
    { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    {
        name: 'VUE 项目规则',
        files: ['**/*.vue'],
        languageOptions: { parserOptions: { parser: tseslint.parser } },
    },
    globalIgnores(['**/.vitepress/cache', '**/dist/']),
    {
        name: '谷歌浏览器插件',
        files: ['projects/github-ids/**/*.js'],
        languageOptions: {
            globals: {
                chrome: 'readonly',
            },
        },
    },
    {
        name: '编辑器插件模板',
        files: ['packages/create-cocos-plugin/templates/**/*.{js,mjs,cjs,ts,vue, jsx, tsx}'],
        languageOptions: {
            globals: {
                Editor: 'readonly',
            },
        },
    },
    ...rulesEditor,
    {
        name: '制定导入顺序规则',
        plugins: {
            import: importPlugin,
        },
        // 自定义规则
        rules: {
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', ['sibling', 'parent'], 'index', 'object', 'type'],
                    pathGroups: [
                        {
                            pattern: 'vue*',
                            group: 'external',
                            position: 'before',
                        },
                        {
                            pattern: '@/hooks/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/contexts/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/components/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/icons/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/service/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/images/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: '@/**',
                            group: 'internal',
                            position: 'before',
                        },
                        {
                            pattern: './**',
                            group: 'sibling',
                            position: 'after',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin'],
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    'newlines-between': 'always',
                },
            ],
        },
    },
]);
