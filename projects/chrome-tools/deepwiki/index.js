const STORAGE_KEY = 'deepwiki_textarea_history';
const MAX_HISTORY_SIZE = 50;

let history = [];
let navigationIndex = -1;
let draftInput = '';

async function loadHistory() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        history = result[STORAGE_KEY] || [];
    } catch (error) {
        history = [];
    }
}

async function saveToHistory(value) {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const savedHistory = result[STORAGE_KEY] || [];

        const existingIndex = savedHistory.indexOf(trimmedValue);
        if (existingIndex !== -1) {
            savedHistory.splice(existingIndex, 1);
        }

        savedHistory.push(trimmedValue);

        if (savedHistory.length > MAX_HISTORY_SIZE) {
            savedHistory.shift();
        }

        await chrome.storage.local.set({ [STORAGE_KEY]: savedHistory });
        history = savedHistory;
        navigationIndex = -1;
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

function navigateHistory(textarea, direction) {
    if (history.length === 0) return;

    if (direction === 'up') {
        if (navigationIndex === -1) {
            navigationIndex = history.length - 1;
        } else if (navigationIndex > 0) {
            navigationIndex--;
        }
        textarea.value = history[navigationIndex];
    } else if (direction === 'down') {
        if (navigationIndex === -1) return;

        if (navigationIndex < history.length - 1) {
            navigationIndex++;
            textarea.value = history[navigationIndex];
        } else {
            navigationIndex = -1;
            textarea.value = draftInput;
        }
    }
    // 让发送按钮变得可用
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

function attachListeners(textarea) {
    if (textarea.getAttribute('has-init') === 'true') {
        return;
    }
    textarea.setAttribute('has-init', 'true');

    textarea.addEventListener('keydown', async (event) => {
        // 如果正在输入法输入状态,不处理方向键
        if (event.isComposing) {
            return;
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (history.length === 0) await loadHistory();
            navigateHistory(textarea, 'up');
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            navigateHistory(textarea, 'down');
        }
    });

    textarea.addEventListener('focus', async () => {
        navigationIndex = -1;
        await loadHistory();
    });

    textarea.addEventListener('change', () => {
        if (navigationIndex === -1) {
            draftInput = textarea.value;
        }
    });

    textarea.addEventListener('blur', () => {
        saveToHistory(textarea.value);
    });
}

function findTextarea() {
    return document.querySelector('textarea[data-deepwiki-input="followup"]') ?? document.querySelector('textarea[data-deepwiki-input="question"]');
}

function initTextareaListener() {
    const textarea = findTextarea();

    if (textarea) {
        attachListeners(textarea);
        return true;
    }

    const observer = new MutationObserver(() => {
        if (initTextareaListener()) {
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

    return false;
}

function init() {
    initTextareaListener();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
