# keyCode 229

## 问题

- 来源： [issue](https://github.com/cocos/3d-tasks/issues/13360)
- 表现： mac 系统，中文输入法下，keydown 的 keyCode 表现怪异，打印出 229

## 排查结论

mac 系统上，无论内置输入法还是第三方输入法；

- keydown: 英文 keyCode 正常，中文 keyCode 错误 为 229；
- keyup:   英文 keyCode 正常，中文 keyCode 正常。

具体原因可以参考这2个说明： 

- [w3c](https://lists.w3.org/Archives/Public/www-dom/2010JulSep/att-0182/keyCode-spec.html)
- [stackoverflow](https://stackoverflow.com/questions/25043934/is-it-ok-to-ignore-keydown-events-with-keycode-229#:~:text=To%20generate%20a%20229%20keyCode%20on%20the%20initial,field%2C%20but%20the%20insertion%20point%20does%20not%20move)

## 解决方案

keyCode 本来就是标记废弃的属性，直接将判断按键的逻辑改为 `event.key` 。测试过在 mac 上中英文都正常打印对应按键的key。


