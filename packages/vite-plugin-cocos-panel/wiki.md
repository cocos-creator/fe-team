# 开发笔记

https://github.com/estree
A community organization for standardizing JS ASTs

| 对比项           | `acorn + acorn-walk`                                    | `estree + estree-walker`                                  |
| ---------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| **AST 解析器**   | `acorn`（自己生成 AST）                                 | 需要自己选择解析器（如 acorn 或 espree 等）               |
| **AST 遍历工具** | `acorn-walk`（为 acorn AST 专用）                       | `estree-walker`（通用遍历器，支持符合 ESTree 规范的 AST） |
| **AST 格式**     | 基于 ESTree，但 acorn 有自己的扩展（如 SourceLocation） | 基于 ESTree 规范，必须手动保证 AST 符合标准               |
| **使用难度**     | 简单直接，适合快速构建分析器                            | 更灵活，适合自定义复杂遍历逻辑                            |
| **可扩展性**     | 适合基础任务，扩展能力中等                              | 高度灵活，适合插件型工具链（如 Rollup、Vite 插件）        |
| **体积和依赖**   | 非常轻量，小依赖                                        | `estree-walker` 也很轻，但可能需要额外 AST 解析器         |

第一个版本使用 `estree-walker` 来遍历 ast，但是 ts 的类型和 `acorn` 返回的不匹配，于是改成了 `acorn-walk`

```Vite 插件生命周期流程图（简化版）
       ┌──────────────┐
       │ vite.config.ts 被加载 │
       └──────┬───────┘
              ▼
     ┌─────────────────────┐
     │ 插件：config         │ ⚙️ 配置修改
     └─────────────────────┘
              ▼
     ┌─────────────────────┐
     │ 插件：configResolved │ ✅ 最早能拿到完整 config 的钩子
     └─────────────────────┘
              ▼
   根据 CLI 参数启动 dev 或 build (apply: 'build' 表示该插件只在 build 启用)
         ▼              ▼
 ┌─────────────┐  ┌──────────────────┐
 │ 开发模式 dev │  │ 构建模式 build    │
 └────┬────────┘  └─────────┬────────┘
      ▼                     ▼

┌────────────┐     ┌─────────────────┐
│ configureServer │     │ buildStart         │
│ （仅 dev 模式） │     │ 每次构建都会执行   │
└────────────┘     └─────────────────┘
                        ▼
                 ┌──────────────┐
                 │ renderStart  │
                 └──────────────┘
                        ▼
                 ┌──────────────┐
                 │ transform    │ 🔄 逐模块处理
                 └──────────────┘
                        ▼
                 ┌──────────────┐
                 │ generateBundle │
                 └──────────────┘
                        ▼
                 ┌──────────────┐
                 │ writeBundle  │
                 └──────────────┘
                        ▼
                 ┌──────────────┐
                 │ closeBundle  │ 🧹 清理资源
                 └──────────────┘
```
