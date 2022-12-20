# AST 初探

## 小试牛刀

cocos creator 的项目设置有一个宏配置，它读取了 [cocos-engine](https://github.com/cocos/cocos-engine/blob/v3.7.0/cocos/core/platform/macro.ts) 项目的某个 ts 脚本动态渲染。如下图的 `ENABLE_ANTIALIAS_FXAA`，hover 的时候能显示相关 tips 。

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
     * balabala
     * @zh
     * 巴拉巴拉
     * @default false
     */
    CLEANUP_IMAGE_CACHE: boolean;

    /**
     * @internal
     */
    init (): void;
}

```

要在编辑器这边拿到这些数据，并关联显示，就需要用到 AST 了。预期是得到如下的数据:

```json
[
    {
        label: "ENABLE_ANTIALIAS_FXAA",
        en: "Used to set FXAA post-processing anti-aliasing, the default value is false.",
        zh: "用于开启 FXAA 后处理抗锯齿, 默认值为 false。"
    },
    {
        label: "CLEANUP_IMAGE_CACHE",
        en: "balabala",
        zh: "巴拉巴拉。"
    }
]
```

### ts.createSourceFile

typescript 为我们提供了一个解析 AST 的 API [createSourceFile](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) ,它能将一个 .ts 文本解析成语法树，我们只要了解了树的结构，然后摘取我们需要的数据即可。

可以通过这个[网站](https://astexplorer.net/)实时查看ts文件对应的语法树:
<img src="https://user-images.githubusercontent.com/35713518/208662750-15452456-3520-4013-bc7f-762c942f5371.png" />

可以看到，我们在 ts 文件里定义了一个  `interface`、 `variable` 和 `function`，那么在语法树里对应着 `statements` 集合里的 `InterfaceDeclaration`、 `VariableStatement` 和 `FunctionDeclaration` :
<img src="https://user-images.githubusercontent.com/35713518/208664733-c3c6f339-78bf-48bf-9a8e-a817c8828357.png" />

所以我们就可以这样一层层的解剖下去，找到所有我们需要的数据即可。

## 进阶
上面的需求我们只是读取了 AST ，组装了相关数据用于实现业务。如果要动态修改某个 ts 文件呢，可以用这个工具 [jscodeshift](https://github.com/facebook/jscodeshift)。

举例：

```js
exports.startup = function() {
    // ....

    COCOS.init(join(__dirname, '..'), {
        // source: 'Visual Studio Installer',
        version: pkg.version,
    });

    // ...
};

```

我们在打包应用的时候，希望给微软打个独立的包，区别只是在个 init 的参数会多一个 soruce 属性，值为 'Visual Studio Installer'。
> 其实这个业务场景用 env 实现更合适，动态修改文件的场景一般是做业务升级的时候，批量替换一些旧的 api 等，行话叫 `codemod` 。

[jscodeshift](https://github.com/facebook/jscodeshift) 实现示例：

先创建一个 transfomr 脚本:
```js
module.exports = function transformer(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    const result = root
        .find(j.CallExpression, {
            callee: { object: { name: 'COCOS' }, property: { name: 'init' } },
        })
        .find(j.Property, { key: { name: 'version' } });

    result.insertAfter(j.property('init', j.identifier('source'), j.stringLiteral('Visual Studio Installer')));

    return root.toSource({ quote: 'single' });
};

```

这段脚本有点类似 JQuery 的操作，找到什么然后做些什么。两个 find 快速找到了准备修改的对象:
- 第一个 find 找到了 COCOS.init
- 第二个 find 接着找到了包含 version 的 Property

我们的目标就是在当前这个 Property 里加一个属性 `source: 'Visual Studio Installer`。 用到了 `.insertAfter` API，最难的就是这个  `.insertAfter` ，我们需要知道如何传递正确的参数，才能构建新的 AST 的合法节点。好在 [astexplorer](https://astexplorer.net/) 可以在线调试，在这个网站中开启 Transform 即可。

<img src="https://user-images.githubusercontent.com/35713518/208672523-1ff9d707-b21f-48d6-9c17-523e69a1d7f5.png" />

然后写一段 js 脚本用 node 执行即可
```js
const { run: jscodeshift } = require('jscodeshift/src/Runner');
const { resolve } = require('node:path');

const transformPath = resolve(__dirname, './hack-codemod.js'); // 上面写的 transfrom 脚本地址
const sourceFile = resolve(__dirname, '../app/utils.js'); // 需要被修改的 js 文件

const options = {
    dry: false, // false: 写入源文件
    print: false,
    verbose: 0,
};

(async function go() {
    await jscodeshift(transformPath, [sourceFile], options);
})();

```        

## 参考链接
- https://github.com/facebook/jscodeshift
- https://astexplorer.net/ 
- https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/jscodeshift/src/core.d.ts 
- https://gogocode.io/zh/docs/specification/introduction/
- http://www.alloyteam.com/2020/08/%E5%88%9D%E6%8E%A2-typescript-%E8%A7%A3%E6%9E%90%E5%99%A8/#prettyPhoto
- https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API
- https://jkchao.github.io/typescript-book-chinese/compiler/overview.html
- https://ts-morph.com/manipulation/