/**
 * 在 PR 页面的评论框 placeholder 中注入 /rerun 命令说明表
 * 参考：https://github.com/SUD-GLOBAL/PinK/pull/1568
 */

const RERUN_TIP = `支持以下命令，并通过评论反馈结果及运行链接：

┌──────────────────────────┬────────────────────┐
│ 命令                     │ 重跑范围           │
├──────────────────────────┼────────────────────┤
│ /rerun、/rerun failed    │ 失败的 Job         │
│ /rerun compile           │ 编译与代码检查     │
│ /rerun macos             │ macOS 平台测试     │
│ /rerun windows           │ Windows 平台测试   │
│ /review                  │ 重新审查           │
└──────────────────────────┴────────────────────┘`;

// 仅在 PR 页面生效
function isPullRequestPage() {
    return /\/pull\/\d+/.test(location.pathname);
}

// 用 Symbol 做标记，避免反复对比大字符串
const INJECTED = Symbol('rerun-injected');

function replaceRerunPlaceholder() {
    if (!isPullRequestPage()) {
        return;
    }
    document.querySelectorAll('.CommentBox-placeholder').forEach(($placeholder) => {
        if ($placeholder[INJECTED]) {
            return;
        }
        $placeholder.textContent = RERUN_TIP;
        // 多行文本需要 pre 换行才能保留，等宽字体保证对齐
        $placeholder.style.cssText += 'white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.4;';
        $placeholder[INJECTED] = true;
    });
    // 输入框最小高度改为 186px，让命令表完整展示
    document.querySelectorAll('.CommentBox-input').forEach(($input) => {
        if ($input[INJECTED]) {
            return;
        }
        $input.style.minHeight = '186px';
        $input[INJECTED] = true;
    });
}

// 评论框懒加载，持续监听 body 变化；200ms 节流避免高频触发
let throttleTimer = null;
const observer = new MutationObserver(() => {
    if (throttleTimer !== null) {
        return;
    }
    throttleTimer = setTimeout(() => {
        throttleTimer = null;
        replaceRerunPlaceholder();
    }, 200);
});
observer.observe(document.body, { childList: true, subtree: true });

// 路由切换兜底（GitHub SPA 不触发 load，但会触发这两个事件）
['hashchange', 'popstate'].forEach((ev) => {
    window.addEventListener(ev, () => {
        [0, 300, 800].forEach((time) => {
            setTimeout(replaceRerunPlaceholder, time);
        });
    });
});

// 立即执行一次（content_scripts 在 document_end 已就绪）
replaceRerunPlaceholder();
