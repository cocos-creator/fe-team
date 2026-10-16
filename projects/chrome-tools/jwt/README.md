# sud 业务检测

在 jwt.io 的 JWT Decoder 输出区域展示「sud 业务检测」卡片，自动判断输入 token 属于 `fat` 还是 `prod`。

- FAT：`https://fat-official-website.s00.tech/api/user/info`
- PROD：`https://cn-000-official-website.s01.tech/api/user/info`

首次加载和 token 变化后自动检测，防抖 500ms。后台同时请求两个接口，使用 `sud-official-at` Cookie，首个返回 HTTP 成功、`code: 0` 且包含 `data.id` 的接口决定环境，并取消另一侧请求。两个接口均未命中时显示「未识别」，网络异常或超时（8 秒）显示「检测失败」，支持重试。

后台使用 `declarativeNetRequestWithHostAccess` 和两个接口域名的权限。临时 session rules 只匹配本扩展发起的、精确 URL 的 GET 请求，不修改浏览器 Cookie；请求不携带已有登录态，不接受响应 Cookie，不使用缓存或跟随跳转。token 不写入本地存储或日志，规则在请求结束和后台重新启动时清理。

JWT 后台逻辑位于 `jwt/background.js`，由扩展统一入口 `common/background.js` 通过 ES Modules 静态导入。

多标签页的检测批次依次执行，每批次的两个接口并行请求，避免不同 token 共用请求头。输入变化或清空时取消该标签页的旧检测，旧结果不会覆盖当前输入。
