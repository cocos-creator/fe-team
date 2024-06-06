import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

const config = defineConfig({
    base: '/fe-team/',
    title: 'Cocos FE',
    description: 'Cocos FE Team',
    head: [['link', { rel: 'icon', href: '/fe-team/favicon.ico' }]],
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
                link: '/docs/',
                activeMatch: '^/docs/',
            },
            {
                text: '基建',
                link: '/core/',
                activeMatch: '^/core/',
            },
            {
                text: '组件',
                link: '/components/',
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

        docFooter: {
            prev: '上一篇',
            next: '下一篇',
        },

        outline: {
            label: '摘要',
        },

        search: {
            provider: 'local',
        },
    },
    lastUpdated: false,
    vite: {
        plugins: [],
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
            items: [{ text: 'cocos creator', link: '/docs/cocos-creator/' }],
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
                { text: 'nvm 安装', link: '/core/nvm/install' },
                { text: 'nvm 命令行执行', link: '/core/nvm/nvm-spawn' },
                { text: '最佳实践-前端工程', link: '/core/前端项目工程实践建议' },
                { text: '最佳实践-命名', link: '/core/intitle' },
                { text: '最佳实践-弃用预处理语言', link: '/core/css-弃用预处理语言' },
                { text: '最佳实践-webComponents', link: '/core/web-components' },
                { text: 'Github ID 翻译', link: '/core/github-ids/' },
                { text: '编辑器插件构建', link: '/core/hello-build' },
                { text: '组件封装-all-in-js', link: '/core/component-all-in-js' },
                { text: '组件封装-headless', link: '/core/headless/' },
            ],
        },
    ];
}

function getComponentsSidebar() {
    return [
        {
            text: '组件',
            items: [{ text: '虚拟列表', link: '/components/virtual-list/' }],
        },
    ];
}
