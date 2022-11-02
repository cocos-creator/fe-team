# 脚本切换 nvm

## 场景

编辑器的工作流希望引入 nvm 来切换 node 版本，目的是可以做到开发者只要执行一条 npm 命令即可启动编辑器项目工程。

思路大致如下：我们自动检测当前用户的 node 版本和项目指定的版本是否匹配，如果不匹配则判断是否有安装 nvm ，如果有则主动安装指定版本并切换，如果没有则提示用户安装 nvm 并手动切换到指定版本。

```js
const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

const nvmrc = join(__dirname, '../../', '.nvmrc');

async function check() {
    if (!existsSync(nvmrc)) return false;

    const nodeVersionProject = readFileSync(nvmrc).toString().trim();
    const nodeVersionCurrent = process.versions.node.replace('\'', '');

    if (nodeVersionProject === nodeVersionCurrent) {
        console.log('当前运行的 node 版本和项目要求的版本一致:', nodeVersionCurrent);
        return true;
    } else {
        console.log('当前运行的 node 版本和项目要求的版本不同:');
        console.log(' => 当前运行版本:', nodeVersionCurrent);
        console.log(' => 项目要求版本:', nodeVersionProject);
        
        // 检测是否有 nvm 
        if(checkNvm()) {
            spawn('nvm', ['install', nodeVersionProject]);
            spawn('nvm', ['use', nodeVersionProject]);
            return true;
        } else {
            console.log('本地没有安装 nvm ，请先安装再切换到对应 node 版本。');
            return false;
        }
    }
}

```

按理说这样的流程是没问题，但是流程卡住了。

## 报错

```bash
Error: spawn nvm ENOENT
    at Process.ChildProcess._handle.onexit (node:internal/child_process:283:19)
    at onErrorNT (node:internal/child_process:478:16)
    at processTicksAndRejections (node:internal/process/task_queues:83:21)
Emitted 'error' event on ChildProcess instance at:
    at Process.ChildProcess._handle.onexit (node:internal/child_process:289:12)
    at onErrorNT (node:internal/child_process:478:16)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  errno: -2,
  code: 'ENOENT',
  syscall: 'spawn nvm',
  path: 'nvm',
  spawnargs: [ 'install', '14.20.1' ]
}
```

> 只有 mac 是这样，因为 mac 和 window 的 nvm 实现本质上是不同的，也不是同一个工具。

***症状一：***
错误提示找不到 nvm 这个命令，但是我们在终端里确实是可以执行 nvm 命令的。

```
➜  cocos-editor git:(develop) ✗ nvm -v
0.39.0
```

***症状二：*** 
如果将脚本中 spawn 里的命令改成如下命令都是可以执行成功的。
```js
spawn('git', ['--version']); // success
spawn('node', ['-v']); // success
```

结合症状一二，我们可以确定，全局是确定有安装 nvm 的，且 spawn 的执行也没问题，那为什么 `spawn('nvm', ['install', 'xxx'])` 就会报错呢？

## 原因

一般情况，如果全局安装了一个命令工具，我们可以通过 `which` 命令打印出它的执行文件在哪里，工具在安装的时候一般是自动 or 我们手动将执行路径加入 PATH 才能在命令行里直接执行。

```
➜  cocos-editor git:(develop) ✗ which git
/usr/bin/git
➜  cocos-editor git:(develop) ✗ which brew
/opt/homebrew/bin/brew
➜  cocos-editor git:(develop) ✗ which node
/Users/alan/.nvm/versions/node/v16.17.1/bin/node
```

但是当我执行 `which nvm` 的时候，打印出来的是一堆 .sh 脚本。所以我们猜测 nvm 这个环境变量不是固定存在的，是动态生成的。

因为我使用的是 zsh 终端工具，于是查看 `.zhrc` 配置文件，在配置文件里发现了一点蛛丝马迹:

```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

在 `.zhrc` 每次配置文件被加载时，都执行了 "$NVM_DIR/nvm.sh"，且注释表明这个就是 load nvm 的作用，于是打开 "$NVM_DIR/nvm.sh" 文件看了下，里面的内容果然就是执行 `which nvm` 显示的那堆脚本。然后注释这段脚本，重启终端，执行 nvm -v ，果然，命令找不到了。

```
➜  ~ nvm -v
zsh: command not found: nvm
```

所以现在问题清楚了，nvm 的全局变量是在每次启动终端工具的时候动态加载的，不像 git 等工具是固化的。这个设计也解释了为什么你启动了终端1 切换了 node 版本之后，再启动一个终端2，node 版本还是默认的，并不会受到另外一个进程的影响。这就是 mac 上多个进程可以保持不同 node 版本的原因。

## 方案

似乎没有比较好的方案，因为我们用 node 的 spawn 创建一个新进程的时候，没办法动态先执行一下 "$NVM_DIR/nvm.sh" 让 nvm 这个命令动态加载到新进程去，关于系统命令本来也属于本人盲区，或者有方案可以解决，后续再看吧，我们现在只能把工具流的自动切换改为提示，让用户自己去切换 node 版本。

<img width="737" alt="image" src="https://user-images.githubusercontent.com/35713518/199439965-cf824122-f952-41e3-b7f9-28ea9c64907f.png">