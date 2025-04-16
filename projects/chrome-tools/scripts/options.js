// 当页面加载时，从存储中读取设置并更新 checkbox 的状态
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['autoShow'], function (data) {
        const autoShowCheckbox = document.getElementById('autoShowCheckbox');
        autoShowCheckbox.checked = data.autoShow ?? true;
    });
});

// 当用户更改 checkbox 状态时，将设置保存到存储中
document.getElementById('autoShowCheckbox').addEventListener('change', function (event) {
    const isChecked = event.target.checked;
    chrome.storage.sync.set({ autoShow: isChecked });
});
