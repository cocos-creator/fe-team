import pkg from 'fs-extra';
const { ensureDirSync, copySync, readdirSync, lstatSync, chmodSync, existsSync } = pkg;
import { join } from 'node:path';
import { spawn } from 'child_process';

export function copy(source, target) {
    /**
     * asar 里不能复制文件夹，需要用 mkdir 创建
     */
    function step(src, dist) {
        if (!existsSync(src)) {
            return;
        }
        const fileStat = lstatSync(src);

        if (fileStat.isDirectory()) {
            ensureDirSync(dist);
            if (!fileStat.isSymbolicLink()) chmodSync(dist, 511);
            const list = readdirSync(src);
            for (const name of list) {
                step(join(src, name), join(dist, name));
            }
        } else {
            copySync(src, dist);
            if (!fileStat.isSymbolicLink()) chmodSync(dist, 511);
        }
    }

    step(source, target);
}

// 创建一个软连接的文件夹 & 复制包含软连接的文件
const child = spawn('ln', ['-s', '/Users/alan/cocos/fe-team/packages-demos/cocos-plugin-vue2', '/Users/alan/cocos/fe-team/packages-demos/others/copy/test']);
child.addListener('close', (code, signal) => {
    if (code === 0) {
        copy('/Users/alan/cocos/fe-team/packages-demos/others/copy/test', '/Users/alan/cocos/fe-team/packages-demos/others/copy/test-copy');
    } else {
        console.log(code, signal);
    }
});
