# AST 初探

## 需求

cocos creator 的项目设置有一个宏配置，它读取了 [cocos-engine](https://github.com/cocos/cocos-engine/blob/v3.7.0/cocos/core/platform/macro.ts) 项目的某个 ts 脚本动态渲染。如下图的 `ENABLE_ANTIALIAS_FXAA`，hover 某个配置的时候能显示相关 tips 。

<img src="https://user-images.githubusercontent.com/35713518/207286655-24c179e4-315c-4606-9c1a-013c579ee1bc.png">

但是在 TS 脚本里这些配置的 tips 是通过注释写在代码里的：

```typescript
interface Macro {
    /**
     * @en
     * Used to set FXAA post-processing anti-aliasing, the default value is false.
     * @zh
     * 用于开启 FXAA 后处理抗锯齿, 默认值为 false。
     * @default false
     */
    ENABLE_ANTIALIAS_FXAA: boolean;

    /**
     * @en
     * Used to set bloom, the default value is false.
     * @zh
     * 用于开启 bloom, 默认值为 false。
     * @default false
     */
    ENABLE_BLOOM: boolean;

    /**
     * @en
     * Whether to clear the original image cache after uploaded a texture to GPU.
     * If cleared, [Dynamic Atlas](https://docs.cocos.com/creator/manual/en/advanced-topics/dynamic-atlas.html) will not be supported.
     * Normally you don't need to enable this option on the web platform, because Image object doesn't consume too much memory.
     * But on Wechat Game platform, the current version cache decoded data in Image object, which has high memory usage.
     * So we enabled this option by default on Wechat, so that we can release Image cache immediately after uploaded to GPU.
     * Currently not useful in 3D engine
     * @zh
     * 是否在将贴图上传至 GPU 之后删除原始图片缓存，删除之后图片将无法进行 [动态合图](https://docs.cocos.com/creator/manual/zh/advanced-topics/dynamic-atlas.html)。
     * 在 Web 平台，你通常不需要开启这个选项，因为在 Web 平台 Image 对象所占用的内存很小。
     * 但是在微信小游戏平台的当前版本，Image 对象会缓存解码后的图片数据，它所占用的内存空间很大。
     * 所以我们在微信平台默认开启了这个选项，这样我们就可以在上传 GL 贴图之后立即释放 Image 对象的内存，避免过高的内存占用。
     * 在 3D 引擎中暂时无效。
     * @default false
     */
    CLEANUP_IMAGE_CACHE: boolean;

    /**
     * @internal
     */
    init (): void;
}

```

要在编辑器这边拿到这些数据，并关联显示，就需要用到 AST 了。正则匹配或许可以，但是更复杂，因为我们的预期是得到如下的数据:

```json
[
    {
        label: "ENABLE_ANTIALIAS_FXAA",
        en: "Used to set FXAA post-processing anti-aliasing, the default value is false.",
        zh: "用于开启 FXAA 后处理抗锯齿, 默认值为 false。"
    },
    {
        label: "ENABLE_BLOOM",
        en: "Used to set bloom, the default value is false.",
        zh: "用于开启 bloom, 默认值为 false。"
    }
]
```

## 实现

### ts.createSourceFile

typescript 为我们提供了一个解析 AST 的 API [createSourceFile](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)

```ts
// 动态读取文件，获得 i18n 信息
    const macroFilePath = join(enginPath, 'cocos/core/platform/macro.ts');
    const macroI18nMap: any = {};
    const language = Editor.I18n.getLanguage();
    
    try {
        if (existsSync(macroFilePath)) {
        
            const sourceFile = ts.createSourceFile(macroFilePath, readFileSync(macroFilePath).toString(), ts.ScriptTarget.Latest, true);
    
            const macroSource = sourceFile.statements.find((v) => {
                return ts.isInterfaceDeclaration(v) && v.name.escapedText === 'Macro';
            }) as ts.InterfaceDeclaration;

            if (macroSource) {
                macroSource.members.filter((v: any) => {
                    return v.jsDoc?.length && ['en', 'zh'].every(tag => v.jsDoc[0].tags.some((o: ts.JSDocTag) => o.tagName.escapedText === tag));
                })
                    .forEach((data: any) => {
                        const tags = data.jsDoc[0].tags;
                        macroI18nMap[data.name.escapedText] = {
                            en: tags.find((v: ts.JSDocTag) => v.tagName.escapedText === 'en').comment,
                            zh: tags.find((v: ts.JSDocTag) => v.tagName.escapedText === 'zh').comment,
                        };
                    });
            }

        }
    } catch (error) {
        console.error(error);
    }
```