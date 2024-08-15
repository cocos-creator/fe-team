import { join } from 'node:path';
import { homedir } from 'os';
import { rimraf } from 'rimraf';
import { unzipDarwin, unzipWin32, unzipNpm } from './unzip.js';

const root = process.cwd();

const downloads = join(homedir(), 'Downloads');
const src = join(downloads, 'unzip-test-file.zip'); // 请在下载目录放置一个用于测试的 zip 文件
const dist = join(root, 'node_modules/0unzip/'); // 解压到 node_modules 不会影响 git

async function testDarwin() {
    if (process.platform !== 'darwin') {
        return;
    }
    await rimraf(dist);
    console.time('unzipDarwin');
    await unzipDarwin(src, dist);
    console.timeEnd('unzipDarwin');
}

async function testWin32() {
    if (process.platform !== 'win32') {
        return;
    }
    await rimraf(dist);
    console.time('unzipWin32');
    await unzipWin32(src, dist);
    console.timeEnd('unzipWin32');
}

async function testNpm() {
    await rimraf(dist);
    console.time('unzipNpm');
    await unzipNpm(src, dist);
    console.timeEnd('unzipNpm');
}

await testDarwin();
await testWin32();
await testNpm();
