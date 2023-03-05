import { defineConfig } from 'vitepress'

module.exports = defineConfig({
    title: 'Cocos FE',
    description: 'Cocos FE Team',
    themeConfig: {
        socialLinks: [
            {
                icon: 'github',
                link: 'https://github.com/cocos-creator/fe-team'
            }
        ],

        nav: [
            {
                text: '文档',
                link: '/docs/index',
                activeMatch: '^/docs/'
            },
            {
                text: '基建',
                link: '/core/index',
                activeMatch: '^/core/'
            },
        ],

        sidebar: {
            '/docs/': getArticleSidebar(),
            '/core/': getCoreSidebar(),
        },

        footer: {
            message: '',
            copyright: 'MIT Licensed | Copyright © 2019-present cocos FE'
        },
    },
    lastUpdated: false
});

function getArticleSidebar() {
    return [
        {
            text: '文档',
            items: [
                {
                    text: 'Git 教程',
                    link: '/docs/Git教程'
                },
                {
                    text: '软链接教程',
                    link: '/docs/symbolic-link'
                },
                {
                    text: 'inspector',
                    link: '/docs/inspector'
                },
                {
                    text: 'cocos creator',
                    link: '/docs/cocos-creator'
                },
                // {
                //     text: 'history',
                //     link: '/docs/history'
                // }
            ]
        },
        {
            text: '踩坑',
            items: [
                { text: 'JSON5',link: '/docs/experience/json5'},
                { text: 'Gitmodules',link: '/docs/experience/gitmodules'},
                { text: 'Keycode 229', link: '/docs/experience/keycode-229' },
                { text: 'emoji', link: '/docs/experience/emoji' },
            ]
        },
        {
            text: '分享',
            items: [
                // {
                //     text: 'AST 初探',
                //     link: '/docs/share/ast'
                // },
                {
                    text: '装机指南-windows',
                    link: '/docs/share/setup-windows'
                },
                {
                    text: '装机指南-mac',
                    link: '/docs/share/setup-mac'
                },
            ]
        }
    ]
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
                // { text: '组件封装-all-in-js', link: '/core/component-all-in-js' },
            ]
        },
    ]
}