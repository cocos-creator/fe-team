// 请求由扩展后台发起；临时规则只给本扩展的两个检查请求设置 Cookie。
const CHECK_MESSAGE = 'sud-jwt:check';
const CANCEL_MESSAGE = 'sud-jwt:cancel';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
const MAX_TOKEN_LENGTH = 16384;
const REQUEST_TIMEOUT = 8000;
const ENVIRONMENTS = [
    { name: 'fat', url: 'https://fat-official-website.s00.tech/api/user/info', ruleId: 910001 },
    { name: 'prod', url: 'https://cn-000-official-website.s01.tech/api/user/info', ruleId: 910002 },
];
const RULE_IDS = ENVIRONMENTS.map((environment) => environment.ruleId);

let pendingJobs = [];
let activeJob = null;
let draining = false;

function removeRules() {
    return chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: RULE_IDS });
}

// Session rules 会跨后台休眠保留，每次后台启动先清理可能残留的 token。
const rulesReady = removeRules().catch(() => {});

function isAllowedSender(sender) {
    try {
        const origin = new URL(sender.url).origin;
        return sender.id === chrome.runtime.id && Number.isInteger(sender.tab?.id) && sender.frameId === 0 && (origin === 'https://www.jwt.io' || origin === 'https://jwt.io');
    } catch {
        return false;
    }
}

function settle(job, result) {
    if (job.settled) return;
    job.settled = true;
    try {
        job.respond(result);
    } catch {
        // 标签页可能已经关闭或跳转。
    }
}

function cancelJob(job) {
    job.cancelled = true;
    job.controllers.forEach((controller) => controller.abort());
    settle(job, { status: 'cancelled' });
}

function cancelJobs(tabId) {
    if (activeJob?.tabId === tabId) cancelJob(activeJob);
    pendingJobs = pendingJobs.filter((job) => {
        if (job.tabId !== tabId) return true;
        cancelJob(job);
        return false;
    });
}

function createRule(environment, token) {
    return {
        id: environment.ruleId,
        priority: 1,
        action: {
            type: 'modifyHeaders',
            requestHeaders: [{ header: 'cookie', operation: 'set', value: `sud-official-at=${token}` }],
        },
        condition: {
            urlFilter: `|${environment.url}|`,
            initiatorDomains: [chrome.runtime.id],
            requestMethods: ['get'],
            resourceTypes: ['xmlhttprequest'],
        },
    };
}

async function probe(environment, controller) {
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const response = await fetch(environment.url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            credentials: 'omit',
            cache: 'no-store',
            redirect: 'error',
            signal: controller.signal,
        });
        if (response.status === 401 || response.status === 403) return { status: 'unmatched' };
        if (!response.ok) return { status: 'error' };

        const body = await response.json();
        if (!body || typeof body.code !== 'number') return { status: 'error' };
        if (body.code === 0 && body.data?.id) return { status: 'matched', environment: environment.name };
        return { status: 'unmatched' };
    } catch {
        return { status: 'error' };
    } finally {
        clearTimeout(timeout);
    }
}

async function checkJob(job) {
    let result = { status: 'error' };
    let requests = [];
    try {
        // 所有标签页按批次排队，避免固定规则被另一个 token 覆盖。
        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: RULE_IDS,
            addRules: ENVIRONMENTS.map((environment) => createRule(environment, job.token)),
        });
        if (job.cancelled) return;

        requests = ENVIRONMENTS.map((environment, index) => probe(environment, job.controllers[index]));
        result = await Promise.any(
            requests.map(async (request) => {
                const outcome = await request;
                if (outcome.status !== 'matched') throw outcome;
                return outcome;
            }),
        ).catch((error) => ({ status: error.errors.every((outcome) => outcome.status === 'unmatched') ? 'unmatched' : 'error' }));
    } catch {
        result = { status: 'error' };
    } finally {
        // 首个接口返回用户数据就停止另一侧，不等待超时。
        job.controllers.forEach((controller) => controller.abort());
        await Promise.allSettled(requests);
        await removeRules().catch(() => {});
        job.token = '';
    }
    if (!job.cancelled) settle(job, result);
}

async function drainJobs() {
    if (draining) return;
    draining = true;
    try {
        await rulesReady;
        while (pendingJobs.length > 0) {
            activeJob = pendingJobs.shift();
            await checkJob(activeJob);
            activeJob = null;
        }
    } finally {
        draining = false;
    }
}

chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message?.type !== CHECK_MESSAGE && message?.type !== CANCEL_MESSAGE) return false;
    if (!isAllowedSender(sender)) {
        respond({ status: 'error' });
        return false;
    }

    if (message.type === CANCEL_MESSAGE) {
        cancelJobs(sender.tab.id);
        respond({ status: 'cancelled' });
        return false;
    }

    const token = message.token;
    if (typeof token !== 'string' || token.length > MAX_TOKEN_LENGTH || !TOKEN_PATTERN.test(token)) {
        respond({ status: 'invalid' });
        return false;
    }

    cancelJobs(sender.tab.id);
    pendingJobs.push({
        tabId: sender.tab.id,
        token,
        respond,
        cancelled: false,
        settled: false,
        controllers: ENVIRONMENTS.map(() => new AbortController()),
    });
    void drainJobs();
    return true;
});
