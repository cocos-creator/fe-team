# @cocos-fe/electron-badge

在 dock 栏图标的左上角显示数字角标。

unix 平台和 win32 平台是不同的实现，所以事实上它们需要接收的初始化参数是不一致的。比如 unix 平台无需使用 BrowserWindow，而 win32 需要通过 BrowserWindow 来实现。

但是为了减少使用者的心智负担，我们对外暴露的接口是统一的，所以参数是所有平台的超集。

## 安装

```bash
npm install @cocos-fe/electron-badge
```

## API

### new ElectronBadge(max, win, [styleOpt]);

-   max: 角标的最大值，假设设置最大值为 99， 当 update 传入 100 时，会显示为： `99+`
-   win: BrowserWindow， win32 平台是通过 win.setOverlayIcon() 来实现角标的。
-   styleOpt: 可选，只在 win32 平台生效
    -   color: string;
    -   background: string;
    -   radius: number;
    -   fontSize: string;
    -   fontFamily: string;
    -   fontWeight: string;

### update(value)

-   value: number 需要设置的数字

### clear()

清空数字角标

## 使用

### 主进程中

```ts
import ElectronBadge, { Badge } from '@cocos-fe/electron-badge/main';
import { BrowserWindow } from 'electron';

const win = new BrowserWindow({ width: 800, height: 600 });

const badge: Badge = new ElectronBadge(3, win);

badge.update(1); // 更新角标

badge.clear(); // 清空角标
```

### 渲染进程

为方便渲染进程中调用 API，内部做了一层 ipc 转发，所以当主进程做了好初始化之后。渲染进程也可以直接调用 `update` 和 `clear`

```js
import badge from '@cocos-fe/electron-badge/render';

badge.update(2); // 更新角标

badge.clear(); // 清空角标
```

注意： 渲染进程不能独立使用，它依赖主进程的实现，所以需要先在主进程做好初始化。
