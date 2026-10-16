(function () {
    'use strict';

    const INPUT_SELECTOR = 'textarea.npm__react-simple-code-editor__textarea';
    const OUTPUT_SELECTOR = '.widget_content__output__B9K8P, [class*="widget_content__output__"]';
    const CARD_ID = 'sud-jwt-check';
    const TOKEN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
    const MAX_TOKEN_LENGTH = 16384;

    let currentInput = null;
    let lastToken = null;
    let revision = 0;
    let debounceTimer;
    let requestPending = false;
    let card;
    let value;
    let retryButton;

    function showStatus(state, text) {
        card.dataset.state = state;
        value.textContent = text;
        retryButton.hidden = state !== 'error' && state !== 'unmatched';
    }

    function ensureCard(output) {
        if (!card) {
            card = document.createElement('section');
            card.id = CARD_ID;
            card.setAttribute('aria-labelledby', `${CARD_ID}-title`);

            const title = document.createElement('h4');
            title.id = `${CARD_ID}-title`;
            title.textContent = 'sud 业务检测';

            const content = document.createElement('p');
            content.setAttribute('role', 'status');
            content.setAttribute('aria-live', 'polite');
            content.append('token 归属环境：');
            value = document.createElement('strong');
            content.append(value);

            retryButton = document.createElement('button');
            retryButton.type = 'button';
            retryButton.textContent = '重新检测';
            retryButton.addEventListener('click', () => handleTokenChange(currentInput?.value.trim() || ''));

            card.append(title, content, retryButton);
            showStatus('idle', '等待输入 token');
        }
        if (output.firstElementChild !== card) output.prepend(card);
    }

    function invalidateRequest() {
        revision += 1;
        clearTimeout(debounceTimer);
        if (requestPending) {
            requestPending = false;
            try {
                void chrome.runtime.sendMessage({ type: 'sud-jwt:cancel' }).catch(() => {});
            } catch {
                // 扩展更新后旧页面的上下文可能已经失效。
            }
        }
    }

    async function checkToken(token, requestRevision) {
        requestPending = true;
        try {
            const result = await chrome.runtime.sendMessage({ type: 'sud-jwt:check', token });
            if (requestRevision !== revision) return;
            if (result?.status === 'matched' && (result.environment === 'fat' || result.environment === 'prod')) {
                showStatus('matched', result.environment);
            } else if (result?.status === 'unmatched') {
                showStatus('unmatched', '未识别');
            } else {
                showStatus('error', '检测失败，请重试');
            }
        } catch {
            if (requestRevision === revision) showStatus('error', '检测失败，请刷新页面后重试');
        } finally {
            if (requestRevision === revision) requestPending = false;
        }
    }

    function handleTokenChange(token) {
        invalidateRequest();
        if (!token) {
            showStatus('idle', '等待输入 token');
            return;
        }
        if (token.length > MAX_TOKEN_LENGTH || !TOKEN_PATTERN.test(token)) {
            showStatus('invalid', '请输入有效的 JWT');
            return;
        }

        showStatus('checking', '检测中…');
        const requestRevision = revision;
        debounceTimer = setTimeout(() => void checkToken(token, requestRevision), 500);
    }

    function syncPage() {
        const input = document.querySelector(INPUT_SELECTOR);
        const output = document.querySelector(OUTPUT_SELECTOR);
        if (!input || !output) {
            if (currentInput) {
                invalidateRequest();
                currentInput = null;
                lastToken = null;
                card?.remove();
            }
            return;
        }

        ensureCard(output);
        currentInput = input;
        const token = input.value.trim();
        if (token !== lastToken) {
            lastToken = token;
            handleTokenChange(token);
        }
    }

    document.addEventListener('input', (event) => {
        if (event.target.matches?.(INPUT_SELECTOR)) syncPage();
    });
    new MutationObserver(syncPage).observe(document.body, { childList: true, subtree: true });
    // .value 的程序赋值不会产生 DOM mutation，覆盖清空、生成示例等页面操作。
    setInterval(syncPage, 500);
    syncPage();
})();
