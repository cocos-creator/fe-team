# Dashboard 解压 zip 调研

## 当前的问题

Dashboard 项目里面安装了各种解压 zip 文件的包，有 yauzl，extract-zip，adm-zip ，还有根据系统调用 spawn 的实现。

很混乱，希望通过这次调研，可以统一解压的方式，删除其余实现。

<!--@include: ./npm.md-->
<!--@include: ./cli.md-->

## 兼容性

npm 包是 nodejs 的实现，本来就是跨平台的，没有兼容性问题。

系统命令是区分平台实现，且 Windows 平台需要携带 7z.exe 文件（828kb）。

## 测试代码

::: code-group
<<< ../../../../packages/unzip/unzip.js
<<< ../../../../packages/unzip/index.js
:::

## 结论

个人偏向直接使用 npm 包的方式，选择 `extract-zip` 来当做唯一的解压包。
