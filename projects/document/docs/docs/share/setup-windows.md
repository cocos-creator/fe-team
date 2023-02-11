# Windows 装机指南

## 登录微软账号

如果链接不上微软服务器，可以按照如下的方式设置一下 DNS 。

![](/setup-windows/dns.png)

> 如果有使用代理，需要关闭系统代理

## 快捷键

> 只列出使用频率高的，例如 win + B 跳转系统托盘的就不记录了，感觉对效率没有提升，不增加记忆负担。

| 快捷键 | 功能 |
| --------- | ---------------- |
| win + A   | 快捷设置面板： WIFI 蓝牙 ... |
| win + D   | 显示桌面 |
| win + E   | 打开资源管理器 |
| win + H   | 启动微软的听写 |
| win + I   | 打开设置 |
| win + L   | 锁屏 |
| win + M   | 窗口最小化 |
| win + N   | 显示通知 日历面板 |
| win + Q/S | 打开搜索 |
| win + V   | 显示云剪切板 |
| win + Z   | 打开窗口布局 |
| win + shift + S   | 专业截屏 |
| win + Home   | 最小化非活动窗口 |

## 必备软件

> Windows 系统现在也有官方的 Store 了，常规软件如：微信、QQ音乐等建议优先使用 Store 下载安装，可以最大程度避免垃圾软件。

> 如果是一些开发软件，推荐使用包管理器 [chocolatey](https://chocolatey.org/install#individual) 安装。

- [chocolatey](https://chocolatey.org/install#individual) window 上的包管理器，类似 Mac OS 的 homebrew 
- Git
- vscode
- [fnm](https://github.com/Schniz/fnm) node 版本管理工具 
- chrome 
- 压缩工具 [7z](https://www.7-zip.org/)
- clash [下载地址](https://github.com/Fndroid/clash_for_windows_pkg/releases) & [使用教程](https://clashforwindows.top/)
- [windTerm](https://github.com/kingToolbox/WindTerm) terminal+ssh+sfpt （据说很好用，当前用不到，未验证）

## 终端

[windows terminal](https://learn.microsoft.com/zh-cn/windows/terminal/install) 是微软官方推出的终端工具，可以整合 cmd、powershell 等。它具有更现代的外观，可以配置主题，极大的提升了操作体验。

推荐使用 [powershell](https://learn.microsoft.com/zh-cn/powershell/scripting/learn/ps101/01-getting-started?view=powershell-7.3) 当作默认的 shell 工具，抛弃陈旧的 cmd 吧。我们可以在 powershell 中配置一些 [Alias]( https://learn.microsoft.com/zh-cn/powershell/module/microsoft.powershell.utility/set-alias?view=powershell-7.2) 让它的使用体验媲美 mac 上的 zsh .

配置地址： 
C:\Users\alan\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1

或者启动 powershell 输入 code $PROFILE 即可打开配置文件进行配置。

```
# fnm 
fnm env --use-on-cd | Out-String | Invoke-Expression

# Setup other alias
Set-Alias open Invoke-Item
Set-Alias ../ GoBack

function GoBack {Set-Location ..}


# Setup git alias
Set-Alias glog GitLogPretty
Set-Alias gst GitStat
Set-Alias gco GitCheckOut
Set-Alias gcom GitCheckOutMaster
Set-Alias gb GitBranch

function GitLogPretty {git log --graph --pretty='%Cred%h%Creset -%C(auto)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --all}
function GitStat {git status}
function GitCheckOut {git checkout}
function GitCheckOutMaster {git checkout 'master'}
function GitBranch {git branch}
```

最终效果如下图，界面好看，且支持 gst 等快捷命令。

![](/setup-windows/windows-terminal.png)


### 实用命令

- open . 将当前的文件地址在资源管理器中打开
- notepad $profile 打开当前 shell 的配置文件 （notepad 是windows 内置的文本编辑工具）

## Fnm

node 的版本管理工具，需要配合一些设置才能完美使用。具体可以查看[github](https://github.com/Schniz/fnm) 。这里记录一些解决方案。

### cmd

1. 搜索 cmd
2. 右键：打开文件所在位置
3. 对`命令提示符` 右键，点击`属性`
4. 修改 `目标` 为: %windir%\system32\cmd.exe /k %USERPROFILE%\bashrc.cmd
5. 进入用户目录（%USERPROFILE%） 创建 bashrc.cmd
6. 写入如下内容
```
@echo off
FOR /f "tokens=*" %%z IN ('fnm env --use-on-cd') DO CALL %%z
```

这样就能在 cmd 里执行 node 命令了。
