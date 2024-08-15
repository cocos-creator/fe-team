## 系统命令 vs npm 包

由于是 electron 应用，所以我们可以通过调用系统的命令来解压，下面是系统命令和 npm 包解压速度的对比。

每个方式测试了 5 次，取个大概的平均值。

|         |  extract-zip   | 系统命令（调用 spawn） |
| ------- | :------------: | :--------------------: |
| Windows | 1 分 15 秒左右 |     1 分 10 秒左右     |
| Mac     |   26 秒左右    |       33 秒左右        |

Mac 原生自带 unzip 命令，Windows 平台是通过 [7z](https://www.7-zip.org/download.html) 来解压。

> 7z 提供了命令行使用的版本，下载后缀为 .7z 的版本。注意看描述是: 7-Zip Extra: standalone console version, 7z DLL, Plugin for Far Manager

注意：

dashboard 当前在 Windows 平台是通过 unzip.exe 来解压的。和 7z 对比之后发现 7z 的性能更好，（特别是在需要覆盖目标路径的情况下）所以在 Windows 的测试里以 7z 为标准。
