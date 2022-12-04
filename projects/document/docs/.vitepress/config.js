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
                    text: 'web-components',
                    link: '/docs/web-components'
                },
                {
                    text: '关于命名的一点建议',
                    link: '/docs/关于命名的一点建议'
                },
                {
                    text: 'Git 教程',
                    link: '/docs/Git教程'
                },
                {
                    text: '软链接教程',
                    link: '/docs/软链接'
                },
                {
                    text: 'inspector',
                    link: '/docs/inspector'
                },
                {
                    text: 'cocos creator',
                    link: '/docs/cocos-creator'
                },
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
                { text: 'nvm 安装', link: '/core/nvm' },
                { text: 'nvm 命令行执行', link: '/core/nvm-spawn' },
                { text: '弃用css预编译处理语言', link: '/core/弃用css预编译处理语言' },
                { text: '前端项目工程实践建议', link: '/core/前端项目工程实践建议'}
            ]
        },
    ]
}