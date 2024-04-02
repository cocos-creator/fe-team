[markdown-it](https://github.com/markdown-it/markdown-it)
[markdown-it-doc](https://github.com/markdown-it/markdown-it/tree/master/docs)
[markdown-it-doc-zh](https://markdown-it.docschina.org/#%E5%AE%89%E8%A3%85)

[markdown-it-container](https://github.com/markdown-it/markdown-it-container)
[拓展 fence 的案例](https://github.com/emersonbottero/vitepress-plugin-mermaid)

[markdown 中文官方教程](https://markdown.com.cn/)

::: yueyue
2024-04-02
:::

```js
    import markdownItContainer from 'markdown-it-container';

    markdown: {
        config: (md) => {
            const name = 'yueyue';
            md.use(markdownItContainer, name, {
                validate: function (params) {
                    // return params.trim().match(/^yueyue\s+(.*)$/);
                    return params.trim() === name;
                },
                render: function (tokens, idx) {
                    const token = tokens[idx];
                    if (token.nesting === 1) {
                        return `<div class="yueyue-container" style="border: 1px solid #eee">\n`;
                    } else {
                        return '</div>\n';
                    }
                },
            });
        },
    },

```
