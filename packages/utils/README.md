- /render 浏览器环境的函数
- /common 不依赖环境的函数
- /node node 环境的函数

只导出 esm 规范的代码，不再兼容 cjs 

构建代码兼容性以目标 electron 的版本为准，包括 node 和 浏览器兼容

构建 ts 的时候 需要 cd 到子文件夹去执行，不要在 root 执行