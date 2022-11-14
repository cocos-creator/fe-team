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
                link: '/article/index',
                activeMatch: '^/article/'
            },
            {
                text: '踩坑',
                link: '/experience/index',
                activeMatch: '^/experience/'
            },
            {
                text: '基建',
                link: '/core/index',
                activeMatch: '^/core/'
            },
        ],

        sidebar: {
            '/article/': getArticleSidebar(),
            '/experience': getExperienceSidebar(),
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
                    text: 'web-components',
                    link: '/article/web-components'
                },
                {
                    text: '关于命名的一点建议',
                    link: '/article/关于命名的一点建议'
                },
                {
                    text: 'Git 教程',
                    link: '/article/Git教程'
                },
                {
                    text: '软链接教程',
                    link: '/article/软链接'
                },
                {
                    text: 'inspector',
                    link: '/article/inspector'
                },
                {
                    text: 'cocos creator',
                    link: '/article/cocos-creator'
                },
                {
                    text: '前端项目工程实践建议',
                    link: '/article/前端项目工程实践建议'
                }
            ]
        }
    ]
}

function getExperienceSidebar() {
    return [
        {
            text: '踩坑经验',
            items: [
                { text: 'JSON5',link: '/experience/json5'},
                { text: 'Gitmodules',link: '/experience/gitmodules'},
                { text: 'Keycode 229',link: '/experience/keycode-229'},
                { text: '脚本切换 nvm ',link: '/experience/spawn-nvm'},
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
                { text: 'Eslint工作流', link: '/core/eslint工作流' },
                { text: 'Github ID 翻译', link: '/core/chrome-extension-github-ids' },
                { text: '编辑器插件构建', link: '/core/editor-plugin-build' },
                { text: 'nvm', link: '/core/nvm' },
                { text: '提议-弃用css预编译处理语言', link: '/core/弃用css预编译处理语言' },
            ]
        },
    ]
}