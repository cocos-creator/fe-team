import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../jwt/background.js', import.meta.url), 'utf8');
const TOKEN_A = 'header.payloadA.signature';
const TOKEN_B = 'header.payloadB.signature';
const extensionId = 'abcdefghijklmnopabcdefghijklmnop';

async function flush() {
    await setImmediate();
    await setImmediate();
}

function harness() {
    let listener;
    let failNextInstall = false;
    const rules = new Map([[910001, { stale: true }]]);
    const calls = [];
    const updates = [];
    const timers = new Map();
    const context = vm.createContext({
        URL,
        AbortController,
        setTimeout(callback) {
            const id = Symbol();
            timers.set(id, callback);
            return id;
        },
        clearTimeout(id) {
            timers.delete(id);
        },
        chrome: {
            runtime: {
                id: extensionId,
                onMessage: {
                    addListener(callback) {
                        listener = callback;
                    },
                },
            },
            declarativeNetRequest: {
                async updateSessionRules(update) {
                    updates.push(structuredClone(update));
                    if (update.addRules && failNextInstall) {
                        failNextInstall = false;
                        throw new Error('Rule installation failed');
                    }
                    update.removeRuleIds?.forEach((id) => rules.delete(id));
                    update.addRules?.forEach((rule) => rules.set(rule.id, structuredClone(rule)));
                },
            },
        },
        fetch(url, options) {
            const rule = [...rules.values()].find((entry) => entry.condition.urlFilter === `|${url}|`);
            assert.ok(rule, 'Request must have its Cookie rule installed');
            return new Promise((resolve, reject) => {
                const call = {
                    url,
                    options,
                    rule,
                    cookie: rule.action.requestHeaders[0].value,
                    resolve(body = { code: 0, data: { id: 'user-1' } }, status = 200) {
                        resolve({ ok: status >= 200 && status < 300, status, json: async () => body });
                    },
                    reject,
                };
                calls.push(call);
                options.signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
                if (options.signal.aborted) reject(new Error('Aborted'));
            });
        },
    });
    vm.runInContext(source, context);

    function send(message, sender = {}) {
        return new Promise((resolve) => {
            listener(message, { id: extensionId, url: 'https://www.jwt.io/', tab: { id: 1 }, frameId: 0, ...sender }, (result) => resolve(structuredClone(result)));
        });
    }

    return {
        rules,
        calls,
        updates,
        timers,
        send,
        check: (token = TOKEN_A, sender) => send({ type: 'sud-jwt:check', token }, sender),
        failNextInstall: () => {
            failNextInstall = true;
        },
        expire: () => [...timers.values()].forEach((callback) => callback()),
    };
}

test('removes stale token rules on service worker startup', async () => {
    const h = harness();
    await flush();
    assert.equal(h.rules.size, 0);
    assert.equal(h.calls.length, 0);
});

for (const environment of ['fat', 'prod']) {
    test(`returns ${environment} on first valid user data, aborts the other request, and clears rules`, async () => {
        const h = harness();
        const result = h.check();
        await flush();
        assert.equal(h.calls.length, 2, 'Both environments must be requested concurrently');
        const index = environment === 'fat' ? 0 : 1;
        h.calls[index].resolve();
        assert.deepEqual(await result, { status: 'matched', environment });
        assert.equal(h.calls[1 - index].options.signal.aborted, true);
        assert.equal(h.rules.size, 0);
        assert.equal(h.timers.size, 0);
    });
}

test('a rejection from one environment does not prevent the other from matching', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.calls[0].resolve({ code: 401, data: null });
    await flush();
    assert.equal(h.calls[1].options.signal.aborted, false);
    h.calls[1].resolve();
    assert.deepEqual(await result, { status: 'matched', environment: 'prod' });
});

test('network failure in one environment still allows the other to match', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.calls[0].reject(new Error('Network unavailable'));
    h.calls[1].resolve();
    assert.deepEqual(await result, { status: 'matched', environment: 'prod' });
});

test('two authentication failures return unmatched', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.calls[0].resolve(null, 401);
    h.calls[1].resolve({ code: 1001, data: null });
    assert.deepEqual(await result, { status: 'unmatched' });
    assert.equal(h.rules.size, 0);
});

test('HTTP 200 without user data is not a match', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.calls[0].resolve({ code: 0, data: null });
    h.calls[1].resolve({ code: 0, data: {} });
    assert.deepEqual(await result, { status: 'unmatched' });
});

test('timeouts are reported as errors and release the request rules', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.expire();
    assert.deepEqual(await result, { status: 'error' });
    assert.equal(h.rules.size, 0);
    assert.equal(h.timers.size, 0);
});

test('server errors and malformed responses are errors, not authentication failures', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    h.calls[0].resolve(null, 503);
    h.calls[1].resolve({ unexpected: true });
    assert.deepEqual(await result, { status: 'error' });
});

test("different tabs cannot overwrite each other's token rules", async () => {
    const h = harness();
    const first = h.check(TOKEN_A);
    await flush();
    const second = h.check(TOKEN_B, { tab: { id: 2 } });
    await flush();
    assert.equal(h.calls.length, 2, 'Second token waits until the first batch is finished');
    h.calls[0].resolve();
    assert.equal((await first).environment, 'fat');
    await flush();
    assert.equal(h.calls.length, 4);
    assert.deepEqual(
        h.calls.map((call) => call.cookie),
        [`sud-official-at=${TOKEN_A}`, `sud-official-at=${TOKEN_A}`, `sud-official-at=${TOKEN_B}`, `sud-official-at=${TOKEN_B}`],
    );
    h.calls[3].resolve();
    assert.equal((await second).environment, 'prod');
    assert.equal(h.rules.size, 0);
});

test('a new token in the same tab cancels active requests before installing its rules', async () => {
    const h = harness();
    const first = h.check(TOKEN_A);
    await flush();
    const second = h.check(TOKEN_B);
    assert.deepEqual(await first, { status: 'cancelled' });
    await flush();
    assert.equal(h.calls[0].options.signal.aborted, true);
    assert.equal(h.calls[1].options.signal.aborted, true);
    assert.equal(h.calls[2].cookie, `sud-official-at=${TOKEN_B}`);
    h.calls[2].resolve();
    assert.equal((await second).environment, 'fat');
});

test('clearing a tab cancels its queued batch without affecting another tab', async () => {
    const h = harness();
    const first = h.check(TOKEN_A);
    await flush();
    const second = h.check(TOKEN_B, { tab: { id: 2 } });
    await h.send({ type: 'sud-jwt:cancel' }, { tab: { id: 2 } });
    assert.deepEqual(await second, { status: 'cancelled' });
    assert.equal(h.calls[0].options.signal.aborted, false);
    h.calls[0].resolve();
    await first;
    await flush();
    assert.equal(h.calls.length, 2);
});

test('rejects unsupported origins, subframes, other extensions, and malformed tokens', async () => {
    const h = harness();
    for (const sender of [{ url: 'https://evil.example/' }, { url: 'https://www.jwt.io.evil.example/' }, { frameId: 1 }, { id: 'other-extension' }]) {
        assert.deepEqual(await h.check(TOKEN_A, sender), { status: 'error' });
    }
    for (const token of ['', 'not-a-token', 'a.b.c; other=secret', 'a.b.c\r\nX-Injected: value', `a.b.${'c'.repeat(16384)}`]) {
        assert.deepEqual(await h.check(token), { status: 'invalid' });
    }
    assert.equal(h.calls.length, 0);
});

test('scopes Cookie injection and excludes browser credentials, cache, and redirects', async () => {
    const h = harness();
    const result = h.check();
    await flush();
    for (const call of h.calls) {
        assert.deepEqual(call.rule.condition.initiatorDomains, [extensionId]);
        assert.deepEqual(call.rule.condition.resourceTypes, ['xmlhttprequest']);
        assert.deepEqual(call.rule.condition.requestMethods, ['get']);
        assert.equal(call.rule.condition.urlFilter, `|${call.url}|`);
        assert.equal(call.options.credentials, 'omit');
        assert.equal(call.options.redirect, 'error');
        assert.equal(call.options.cache, 'no-store');
    }
    h.calls[0].resolve();
    await result;
});

test('rule installation failure does not send unauthenticated requests or block later jobs', async () => {
    const h = harness();
    h.failNextInstall();
    assert.deepEqual(await h.check(), { status: 'error' });
    assert.equal(h.calls.length, 0);
    const next = h.check(TOKEN_B);
    await flush();
    h.calls[0].resolve();
    assert.equal((await next).environment, 'fat');
    assert.equal(h.rules.size, 0);
});
