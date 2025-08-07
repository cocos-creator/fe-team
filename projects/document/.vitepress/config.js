import { defineConfig } from 'vitepress';
// import { withMermaid } from 'vitepress-plugin-mermaid';

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
        ],

        sidebar: {
            '/docs/': getArticleSidebar(),
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
    },
    lastUpdated: false,
    vite: {
        plugins: [],
    },
});

// export default withMermaid(config, {
//     mermaid: {},
//     mermaidPlugin: {},
// });

export default config;

function getArticleSidebar() {
    return [
        {
            text: '文档',
            items: [
                { text: 'cocos creator', link: '/docs/cocos-creator/' },
                { text: '开发 creator 插件', link: '/docs/create-cocos-plugin/index.md' },
                { text: '解压 zip', link: '/docs/unzip/index.md' },
                { text: '编辑器用户手册文档重构', link: '/docs/versions-i18n-docs/index.md' },
                { text: 'emoji', link: '/docs/emoji.md' },
            ],
        },
    ];
}
