# 公共后台入口

`background.js` 是整个扩展的 Service Worker 入口，通过 ES Modules 静态导入各功能的后台模块。

新增后台功能时，将业务逻辑放在对应功能目录的 `background.js` 中，再在此入口添加静态 `import`。各模块使用独立的消息类型前缀，只处理自己的消息；事件监听器在模块加载时同步注册。

目前加载的功能：

- `../jwt/background.js`：处理 `sud-jwt:*` 消息，检测 token 环境；使用 session rule ID `910001`、`910002`，其他功能应避免占用。
