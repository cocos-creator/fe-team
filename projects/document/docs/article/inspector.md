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
```js
const dump = {
    "active": {
        "value": true,
        "default": null,
        "type": "Boolean",
        "readonly": false,
        "visible": true,
        "displayName": "Active",
        "extends": []
    },
    "locked": {
        "value": false,
        "default": false,
        "type": "Boolean",
        "readonly": false,
        "visible": true,
        "displayName": "Locked",
        "extends": []
    },
    "name": {
        "value": "Main Camera",
        "default": null,
        "type": "String",
        "readonly": false,
        "visible": true,
        "displayName": "Name",
        "extends": []
    },
    "position": {
        "value": {
            "x": -10,
            "y": 10,
            "z": 10
        },
        "default": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "type": "cc.Vec3",
        "readonly": false,
        "visible": true,
        "displayName": "Position",
        "extends": [
            "cc.ValueType"
        ]
    },
    "rotation": {
        "value": {
            "x": -35,
            "y": -45,
            "z": 0
        },
        "default": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "type": "cc.Vec3",
        "readonly": false,
        "visible": true,
        "displayName": "Rotation",
        "extends": [
            "cc.ValueType"
        ]
    },
    "scale": {
        "value": {
            "x": 1,
            "y": 1,
            "z": 1
        },
        "default": {
            "x": 1,
            "y": 1,
            "z": 1
        },
        "type": "cc.Vec3",
        "readonly": false,
        "visible": true,
        "displayName": "Scale",
        "extends": [
            "cc.ValueType"
        ]
    },
    "layer": {
        "value": 1073741824,
        "default": 1073741824,
        "type": "Enum",
        "readonly": false,
        "visible": true,
        "enumList": [
            {
                "name": "NONE",
                "value": 0
            },
            {
                "name": "IGNORE_RAYCAST",
                "value": 1048576
            },
            {
                "name": "GIZMOS",
                "value": 2097152
            },
            {
                "name": "EDITOR",
                "value": 4194304
            },
            {
                "name": "UI_3D",
                "value": 8388608
            },
            {
                "name": "SCENE_GIZMO",
                "value": 16777216
            },
            {
                "name": "UI_2D",
                "value": 33554432
            },
            {
                "name": "PROFILER",
                "value": 268435456
            },
            {
                "name": "DEFAULT",
                "value": 1073741824
            },
            {
                "name": "ALL",
                "value": 4294967295
            }
        ],
        "displayName": "Layer",
        "extends": []
    },
    "uuid": {
        "value": "c9DMICJLFO5IeO07EPon7U",
        "default": null,
        "type": "String",
        "readonly": false,
        "visible": true,
        "displayName": "UUID",
        "extends": []
    },
    "parent": {
        "value": {
            "uuid": "f46876e4-e81b-4931-b493-6d367be385e7"
        },
        "type": "cc.Node",
        "readonly": false,
        "visible": true,
        "extends": [
            "cc.BaseNode",
            "cc.Object"
        ]
    },
    "children": [],
    "__type__": "cc.Node",
    "__comps__": [
        {
            "value": {
                "uuid": {
                    "value": "7dWQTpwS5LrIHnc1zAPUtf",
                    "default": null,
                    "type": "String",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "name": {
                    "value": "Main Camera<Camera>",
                    "default": null,
                    "type": "String",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "enabled": {
                    "value": true,
                    "default": null,
                    "type": "Boolean",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_name": {
                    "name": "_name",
                    "value": "",
                    "default": "",
                    "type": "String",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_objFlags": {
                    "name": "_objFlags",
                    "value": 63488,
                    "default": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "__scriptAsset": {
                    "name": "__scriptAsset",
                    "value": {},
                    "type": "cc.Script",
                    "readonly": true,
                    "visible": false,
                    "displayName": "Script",
                    "tooltip": "i18n:INSPECTOR.component.script",
                    "animatable": false,
                    "extends": [
                        "cc.Asset",
                        "Eventified",
                        "cc.GCObject",
                        "cc.Object"
                    ],
                    "displayOrder": -999
                },
                "node": {
                    "name": "node",
                    "value": {
                        "uuid": "c9DMICJLFO5IeO07EPon7U"
                    },
                    "default": null,
                    "type": "cc.Node",
                    "readonly": false,
                    "visible": false,
                    "extends": [
                        "cc.BaseNode",
                        "cc.Object"
                    ]
                },
                "_enabled": {
                    "name": "_enabled",
                    "value": true,
                    "default": true,
                    "type": "Boolean",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "__prefab": {
                    "name": "__prefab",
                    "value": null,
                    "default": null,
                    "type": "Unknown",
                    "readonly": false,
                    "visible": false
                },
                "_projection": {
                    "name": "_projection",
                    "value": 1,
                    "default": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_priority": {
                    "name": "_priority",
                    "value": 0,
                    "default": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_fov": {
                    "name": "_fov",
                    "value": 45,
                    "default": 45,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_fovAxis": {
                    "name": "_fovAxis",
                    "value": 0,
                    "default": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_orthoHeight": {
                    "name": "_orthoHeight",
                    "value": 10,
                    "default": 10,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_near": {
                    "name": "_near",
                    "value": 1,
                    "default": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_far": {
                    "name": "_far",
                    "value": 1000,
                    "default": 1000,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_color": {
                    "name": "_color",
                    "value": {
                        "r": 51,
                        "g": 51,
                        "b": 51,
                        "a": 255
                    },
                    "default": {
                        "_val": 4281545523
                    },
                    "type": "cc.Color",
                    "readonly": false,
                    "visible": false,
                    "extends": [
                        "cc.ValueType"
                    ]
                },
                "_depth": {
                    "name": "_depth",
                    "value": 1,
                    "default": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_stencil": {
                    "name": "_stencil",
                    "value": 0,
                    "default": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_clearFlags": {
                    "name": "_clearFlags",
                    "value": 7,
                    "default": 7,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_rect": {
                    "name": "_rect",
                    "value": {
                        "x": 0,
                        "y": 0,
                        "width": 1,
                        "height": 1
                    },
                    "default": {
                        "x": 0,
                        "y": 0,
                        "width": 1,
                        "height": 1
                    },
                    "type": "cc.Rect",
                    "readonly": false,
                    "visible": false,
                    "extends": [
                        "cc.ValueType"
                    ]
                },
                "_aperture": {
                    "name": "_aperture",
                    "value": 19,
                    "default": 19,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_shutter": {
                    "name": "_shutter",
                    "value": 7,
                    "default": 7,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_iso": {
                    "name": "_iso",
                    "value": 0,
                    "default": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_screenScale": {
                    "name": "_screenScale",
                    "value": 1,
                    "default": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_visibility": {
                    "name": "_visibility",
                    "value": 1822425087,
                    "default": -325058561,
                    "type": "Number",
                    "readonly": false,
                    "visible": false,
                    "extends": []
                },
                "_targetTexture": {
                    "name": "_targetTexture",
                    "value": null,
                    "default": null,
                    "type": "Unknown",
                    "readonly": false,
                    "visible": false
                },
                "priority": {
                    "name": "priority",
                    "value": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.priority",
                    "displayOrder": 0,
                    "extends": []
                },
                "visibility": {
                    "name": "visibility",
                    "value": 1822425087,
                    "type": "BitMask",
                    "readonly": false,
                    "visible": true,
                    "bitmaskList": [
                        {
                            "name": "NONE",
                            "value": 0
                        },
                        {
                            "name": "IGNORE_RAYCAST",
                            "value": 1048576
                        },
                        {
                            "name": "GIZMOS",
                            "value": 2097152
                        },
                        {
                            "name": "EDITOR",
                            "value": 4194304
                        },
                        {
                            "name": "UI_3D",
                            "value": 8388608
                        },
                        {
                            "name": "SCENE_GIZMO",
                            "value": 16777216
                        },
                        {
                            "name": "UI_2D",
                            "value": 33554432
                        },
                        {
                            "name": "PROFILER",
                            "value": 268435456
                        },
                        {
                            "name": "DEFAULT",
                            "value": 1073741824
                        },
                        {
                            "name": "ALL",
                            "value": 4294967295
                        }
                    ],
                    "tooltip": "i18n:camera.visibility",
                    "displayOrder": 1,
                    "extends": []
                },
                "clearFlags": {
                    "name": "clearFlags",
                    "value": 7,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "DONT_CLEAR",
                            "value": 0
                        },
                        {
                            "name": "DEPTH_ONLY",
                            "value": 6
                        },
                        {
                            "name": "SOLID_COLOR",
                            "value": 7
                        },
                        {
                            "name": "SKYBOX",
                            "value": 14
                        }
                    ],
                    "tooltip": "i18n:camera.clear_flags",
                    "displayOrder": 2,
                    "extends": []
                },
                "clearColor": {
                    "name": "clearColor",
                    "value": {
                        "r": 51,
                        "g": 51,
                        "b": 51,
                        "a": 255
                    },
                    "type": "cc.Color",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.color",
                    "displayOrder": 3,
                    "extends": [
                        "cc.ValueType"
                    ]
                },
                "clearDepth": {
                    "name": "clearDepth",
                    "value": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.depth",
                    "displayOrder": 4,
                    "extends": []
                },
                "clearStencil": {
                    "name": "clearStencil",
                    "value": 0,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.stencil",
                    "displayOrder": 5,
                    "extends": []
                },
                "projection": {
                    "name": "projection",
                    "value": 1,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "ORTHO",
                            "value": 0
                        },
                        {
                            "name": "PERSPECTIVE",
                            "value": 1
                        }
                    ],
                    "tooltip": "i18n:camera.projection",
                    "displayOrder": 6,
                    "extends": []
                },
                "fovAxis": {
                    "name": "fovAxis",
                    "value": 0,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "VERTICAL",
                            "value": 0
                        },
                        {
                            "name": "HORIZONTAL",
                            "value": 1
                        }
                    ],
                    "tooltip": "i18n:camera.fov_axis",
                    "displayOrder": 7,
                    "extends": []
                },
                "fov": {
                    "name": "fov",
                    "value": 45,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.fov",
                    "displayOrder": 8,
                    "extends": []
                },
                "orthoHeight": {
                    "name": "orthoHeight",
                    "value": 10,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.ortho_height",
                    "displayOrder": 9,
                    "extends": []
                },
                "near": {
                    "name": "near",
                    "value": 1,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.near",
                    "displayOrder": 10,
                    "extends": []
                },
                "far": {
                    "name": "far",
                    "value": 1000,
                    "type": "Number",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.far",
                    "displayOrder": 11,
                    "extends": []
                },
                "aperture": {
                    "name": "aperture",
                    "value": 19,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "F1_8",
                            "value": 0
                        },
                        {
                            "name": "F2_0",
                            "value": 1
                        },
                        {
                            "name": "F2_2",
                            "value": 2
                        },
                        {
                            "name": "F2_5",
                            "value": 3
                        },
                        {
                            "name": "F2_8",
                            "value": 4
                        },
                        {
                            "name": "F3_2",
                            "value": 5
                        },
                        {
                            "name": "F3_5",
                            "value": 6
                        },
                        {
                            "name": "F4_0",
                            "value": 7
                        },
                        {
                            "name": "F4_5",
                            "value": 8
                        },
                        {
                            "name": "F5_0",
                            "value": 9
                        },
                        {
                            "name": "F5_6",
                            "value": 10
                        },
                        {
                            "name": "F6_3",
                            "value": 11
                        },
                        {
                            "name": "F7_1",
                            "value": 12
                        },
                        {
                            "name": "F8_0",
                            "value": 13
                        },
                        {
                            "name": "F9_0",
                            "value": 14
                        },
                        {
                            "name": "F10_0",
                            "value": 15
                        },
                        {
                            "name": "F11_0",
                            "value": 16
                        },
                        {
                            "name": "F13_0",
                            "value": 17
                        },
                        {
                            "name": "F14_0",
                            "value": 18
                        },
                        {
                            "name": "F16_0",
                            "value": 19
                        },
                        {
                            "name": "F18_0",
                            "value": 20
                        },
                        {
                            "name": "F20_0",
                            "value": 21
                        },
                        {
                            "name": "F22_0",
                            "value": 22
                        }
                    ],
                    "tooltip": "i18n:camera.aperture",
                    "displayOrder": 12,
                    "extends": []
                },
                "shutter": {
                    "name": "shutter",
                    "value": 7,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "D1",
                            "value": 0
                        },
                        {
                            "name": "D2",
                            "value": 1
                        },
                        {
                            "name": "D4",
                            "value": 2
                        },
                        {
                            "name": "D8",
                            "value": 3
                        },
                        {
                            "name": "D15",
                            "value": 4
                        },
                        {
                            "name": "D30",
                            "value": 5
                        },
                        {
                            "name": "D60",
                            "value": 6
                        },
                        {
                            "name": "D125",
                            "value": 7
                        },
                        {
                            "name": "D250",
                            "value": 8
                        },
                        {
                            "name": "D500",
                            "value": 9
                        },
                        {
                            "name": "D1000",
                            "value": 10
                        },
                        {
                            "name": "D2000",
                            "value": 11
                        },
                        {
                            "name": "D4000",
                            "value": 12
                        }
                    ],
                    "tooltip": "i18n:camera.shutter",
                    "displayOrder": 13,
                    "extends": []
                },
                "iso": {
                    "name": "iso",
                    "value": 0,
                    "type": "Enum",
                    "readonly": false,
                    "visible": true,
                    "enumList": [
                        {
                            "name": "ISO100",
                            "value": 0
                        },
                        {
                            "name": "ISO200",
                            "value": 1
                        },
                        {
                            "name": "ISO400",
                            "value": 2
                        },
                        {
                            "name": "ISO800",
                            "value": 3
                        }
                    ],
                    "tooltip": "i18n:camera.ISO",
                    "displayOrder": 14,
                    "extends": []
                },
                "rect": {
                    "name": "rect",
                    "value": {
                        "x": 0,
                        "y": 0,
                        "width": 1,
                        "height": 1
                    },
                    "type": "cc.Rect",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.rect",
                    "displayOrder": 15,
                    "extends": [
                        "cc.ValueType"
                    ]
                },
                "targetTexture": {
                    "name": "targetTexture",
                    "value": {
                        "uuid": ""
                    },
                    "type": "cc.RenderTexture",
                    "readonly": false,
                    "visible": true,
                    "tooltip": "i18n:camera.target_texture",
                    "displayOrder": 16,
                    "extends": [
                        "cc.TextureBase",
                        "cc.Asset",
                        "Eventified",
                        "cc.GCObject",
                        "cc.Object"
                    ]
                }
            },
            "type": "cc.Camera",
            "readonly": false,
            "visible": true,
            "cid": "cc.Camera",
            "editor": {
                "inspector": "",
                "icon": "",
                "help": "i18n:cc.Camera",
                "_showTick": true
            },
            "extends": [
                "cc.Component",
                "cc.Object"
            ]
        }
    ]
}
```

