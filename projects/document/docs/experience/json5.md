# JSON5

[JSON5](https://json5.org/) 是 `JSON` 的一个超级，类似 `ts` 之于 `js`。

## 踩坑记录

vscode 允许一些 json 格式的配置项以 json5 的语法进行编写的。比如 `tsconfig.json` 就是一个支持 json5 的语法格式的配置文件。

如果你的业务场景里需要 require 这类 json 文件，则会直接返回 undefined，容易让人产生困惑。（因为被 required 的 xx.json 在 vscode 里没有报语法错误，你打印文件路径也是真实存在的）。

此时你一定要看看该 json 文件是否使用了 json5 的语法。

## 建议

在非必要的情况下，都以严格模式的 json 语法进行书写，避免不必要的错误排查。

如果是一些比较复杂的 json 配置，可以使用 json5 的语法，毕竟它支持注释等高级能力，可以提高可读性。具体用法参考[JSON5](https://json5.org/)。