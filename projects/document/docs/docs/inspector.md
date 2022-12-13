---
navbar: true
sidebar: true
---

# Inspector 

Inspector 负责各种数据的显示和更新功能，目前包括（node、asset）两种数据。它只是一个平台，数据和渲染组件都不是由它提供。

## 数据获取

通过配置 package.json/contribution.message
```json
{
    message: {
        "selection:select": {
            "methods": [
                "default.selected"
            ]
        },
        "selection:unselect": {
            "methods": [
                "default.unselected"
            ]
        },
    }
}
```

当 selected 和 unselected 被触发时，得到当前的数据

```js
panel.type = Editor.Selection.getLastSelectedType();
panel.uuids = Editor.Selection.getSelected(panel.type);
```

通过 type 判断当前的数据类型，决定渲染哪个面板

```js
panel.$.content.setAttribute('src', queryType(panel.type) || '');
panel.$.content.update(panel.uuids, queryRendererMap(panel.type), queryType(), queryRendererMap());
```

## 面板的注册

面板的代码放置在 engine 仓库，通过 Inspector 的 hooks.js 动态注册到 Inspector 上。


```js
// hooks.js
exports.register = async function(info) {
    const engine = await Editor.Message.request('engine', 'query-info');

    info.contributions.inspector.type.asset = join(engine.path, 'editor/inspector/contributions/asset.js');
    info.contributions.inspector.type.node = join(engine.path, 'editor/inspector/contributions/node.js');
};
```

## dump 解释

dump有动词和名词两种场景。

- 1、为什么要dump（dump的目的）？

因为程序在计算机中运行时，在内存、CPU、I/O等设备上的数据都是动态的（或者说是易失的），也就是说数据使用完或者发生异常就会丢掉。如果我想得到某些时刻的数据（有可能是调试程序Bug或者收集某些信息），就要把他转储（dump）为静态（如文件）的形式。否则，这些数据你永远都拿不到。

- 2、dump转储的是什么内容（dump的对象）？

其实上边已经提到了，就是将动态（易失）的数据，保存为静态的数据（持久数据）。像程序这种本来就保存在存储介质（如硬盘）中的数据，也就没有必要dump。


现在，dump作为名词也很好理解了，一般就是指dump(动词)的结果文件。

回到我们的编辑器，场景资源是通过 xxx.scene 持久化的，但是在编辑场景的时候，没有将临时数据持久化下来，而 Inspector 需要对选中的节点进行编辑，就需要将该节点 `dump`(v) 出来，得到 `dump`(n)，供 Inspector 编辑。
## 获取 dump 

asset 和 node  都有 uuid，它们的格式如下：

- asset:  738e82d9-bc62-4628-8bd2-8ebacb85fec0 
- node:  c0y6F5f+pAvI805TdmxIjx

通过 uuid 获取 dump 数据
- Editor.Message.request('scene', 'query-node', uuid);
- Editor.Message.request('asset-db', 'query-asset-info', uuid);


## 渲染 dump

略。。。

## 更新 dump
通过 ui-prop 发送修改事件，对数据进行更新

```js
Editor.Message.send('scene', 'set-property', {
    uuid,
    path,
    dump: {
        type,
        isArray,
        value,
    },
});
```

## asset 数据格式总览
```js
const dump = {
    "name": "background.js",
    "displayName": "",
    "source": "db://assets/background.js",
    "path": "db://assets/background",
    "url": "db://assets/background.js",
    "file": "/Users/alan/cocos/games/mind-your-step/assets/background.js",
    "uuid": "d775f63a-58ce-40f5-a92b-d8b314a70f7d",
    "importer": "javascript",
    "imported": true,
    "invalid": false,
    "type": "cc.Script",
    "isDirectory": false,
    "library": {},
    "subAssets": {},
    "visible": true,
    "readonly": false
}
```

## node 数据格式总览


略...