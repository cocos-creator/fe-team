#!/usr/bin/env node
/**
 * 打包 chrome-tools 扩展为 zip，供 Chrome Web Store 上传。
 *
 * 约定：
 * - 演示图统一放在各功能目录的 `images/` 子目录，打包时整体排除
 * - `README.md`、`.DS_Store`、`scripts/`、`dist/`、`node_modules/`、`package.json` 不进入 zip
 * - `public/` 整体保留
 *
 * 用法：pnpm zip  （在 projects/chrome-tools 目录下）
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionRoot = path.resolve(__dirname, '..');
const distDir = path.join(extensionRoot, 'dist');

/** 需要跳过的顶层条目 */
const SKIP_TOP_LEVEL = new Set(['.DS_Store', 'dist', 'node_modules', 'scripts', 'package.json']);

/**
 * 判断相对路径是否应被排除。
 * @param {string} rel 相对 extensionRoot 的路径（POSIX 分隔符）
 */
function shouldExclude(rel) {
    if (!rel || rel === '.') return false;
    const segments = rel.split('/');
    const top = segments[0];

    if (SKIP_TOP_LEVEL.has(top)) return true;
    if (segments.includes('images')) return true;
    if (segments.at(-1) === 'README.md') return true;
    if (segments.at(-1) === '.DS_Store') return true;

    return false;
}

/**
 * 递归收集需要打包的文件（相对路径）。
 * @param {string} dir 当前遍历目录（绝对路径）
 * @param {string} prefix 相对前缀
 * @returns {string[]}
 */
function collectFiles(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (shouldExclude(rel)) continue;

        const abs = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectFiles(abs, rel));
        } else if (entry.isFile()) {
            files.push(rel);
        }
    }

    return files;
}

function main() {
    const manifestPath = path.join(extensionRoot, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
        console.error(`[zip] manifest.json 不存在: ${manifestPath}`);
        process.exit(1);
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const version = manifest.version;
    if (!version) {
        console.error('[zip] manifest.json 缺少 version 字段');
        process.exit(1);
    }

    fs.mkdirSync(distDir, { recursive: true });
    const zipName = `chrome-tools-${version}.zip`;
    const zipPath = path.join(distDir, zipName);

    const files = collectFiles(extensionRoot);

    // 防御：核心文件必须存在
    for (const required of ['manifest.json', 'popup.html']) {
        if (!files.includes(required)) {
            console.error(`[zip] 缺少必需文件: ${required}`);
            process.exit(1);
        }
    }

    // 复制到临时目录
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-tools-'));
    let zipped = false;

    try {
        for (const rel of files) {
            const src = path.join(extensionRoot, rel);
            const dest = path.join(tmpDir, rel);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(src, dest);
        }

        // 打包（macOS/Linux 自带 zip）
        try {
            execFileSync('zip', ['-r', '-X', zipPath, '.'], { cwd: tmpDir, stdio: 'pipe' });
            zipped = true;
        } catch (err) {
            console.error(`[zip] 系统 zip 命令执行失败: ${err.message}`);
            console.error(`[zip] 临时目录保留在: ${tmpDir}`);
            console.error('[zip] 请手动压缩该目录内容后上传 Chrome Web Store');
            process.exit(1);
        }
    } finally {
        if (zipped) {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }
    }

    const sizeKB = (fs.statSync(zipPath).size / 1024).toFixed(1);
    console.log(`[zip] 打包完成: ${zipPath} (${sizeKB} KB)`);
    console.log(`[zip] 共 ${files.length} 个文件:`);
    for (const f of files) {
        console.log(`      ${f}`);
    }
}

main();
