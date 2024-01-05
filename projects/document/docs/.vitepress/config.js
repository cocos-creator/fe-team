import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';
import { SearchPlugin } from 'vitepress-plugin-search';

const config = defineConfig({
    title: 'Cocos FE',
    description: 'Cocos FE Team',
    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/cocos-creator/fe-team',
            },
        ],

        nav: [
            {
                text: '文档',
                link: '/docs/index',
                activeMatch: '^/docs/',
            },
            {
                text: '基建',
                link: '/core/index',
                activeMatch: '^/core/',
            },
            {
                text: '组件',
                link: '/components/index',
                activeMatch: '^/components/',
            },
        ],

        sidebar: {
            '/docs/': getArticleSidebar(),
            '/core/': getCoreSidebar(),
            '/components/': getComponentsSidebar(),
        },

        footer: {
            message: '',
            copyright: 'MIT Licensed | Copyright © 2019-present cocos FE',
        },
    },
    lastUpdated: false,
    vite: {
        plugins: [SearchPlugin()],
    },
});

export default withMermaid(config, {
    mermaid: {},
    mermaidPlugin: {},
});

function getArticleSidebar() {
    return [
        {
            text: '文档',
            items: [
                { text: 'Git 教程', link: '/docs/Git教程' },
                { text: '软链接教程', link: '/docs/symbolic-link' },
                { text: 'inspector', link: '/docs/inspector' },
                { text: 'cocos creator', link: '/docs/cocos-creator' },
                { text: 'Dashboard 2.1', link: '/docs/dashboard-v2.1' },
                { text: 'Dashboard 1.2.6', link: '/docs/dashboard-v1.2.6' },
                { text: '文档地址中转', link: '/docs/文档地址中转' },
            ],
        },
        {
            text: '踩坑',
            items: [
                { text: 'JSON5', link: '/docs/experience/json5' },
                { text: 'Gitmodules', link: '/docs/experience/gitmodules' },
                { text: 'Keycode 229', link: '/docs/experience/keycode-229' },
                { text: 'emoji', link: '/docs/experience/emoji' },
            ],
        },
        {
            text: '分享',
            items: [
                { text: 'AST 初探', link: '/docs/share/ast' },
                { text: 'JSON Schema', link: '/docs/share/json-schema' },
                { text: '装机指南-windows', link: '/docs/share/setup-windows' },
                { text: '装机指南-mac', link: '/docs/share/setup-mac' },
            ],
        },
        {
            text: 'Typescript',
            items: [{ text: '笔记', link: '/docs/typescript/index' }],
        },
    ];
}

function getCoreSidebar() {
    return [
        {
            text: '基建',
            items: [
                { text: 'Eslint', link: '/core/eslint' },
                { text: 'Eslint 工作流', link: '/core/eslint-工作流' },
                { text: 'nvm 安装', link: '/core/nvm' },
                { text: 'nvm 命令行执行', link: '/core/nvm-spawn' },
                { text: '最佳实践-前端工程', link: '/core/前端项目工程实践建议' },
                { text: '最佳实践-命名', link: '/core/intitle' },
                { text: '最佳实践-弃用预处理语言', link: '/core/css-弃用预处理语言' },
                { text: '最佳实践-webComponents', link: '/core/web-components' },
                { text: 'Github ID 翻译', link: '/core/github-ids' },
                { text: '编辑器插件构建', link: '/core/hello-build' },
                { text: '组件封装-all-in-js', link: '/core/component-all-in-js' },
                { text: '组件封装-headless', link: '/core/component-headless' },
            ],
        },
    ];
}

function getComponentsSidebar() {
    return [
        {
            text: '组件',
            items: [{ text: '虚拟列表', link: '/components/virtual-list/index' }],
        },
    ];
}
