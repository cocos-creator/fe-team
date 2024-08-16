'use strict';
import { spawn } from 'node:child_process';
import extract from 'extract-zip';
import { join } from 'node:path';

const root = process.cwd();

/**
 * @param src
 * @param dist
 * @returns
 */
export function unzipDarwin(src, dist) {
    return new Promise((resolve, reject) => {
        const child = spawn('unzip', ['-o', src, '-d', dist]);

        child.stdout.on('data', () => {}); // 必须消费标准输出，否则可能导致进程阻塞或挂起
        child.stderr.on('data', console.error);

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(code);
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

export function unzipWin32(src, dist) {
    return new Promise((resolve, reject) => {
        //const child = spawn(join(root, 'unzip.exe'),['-n', src, '-d', dist]);

        const child = spawn(join(root, '7za-2408.exe'), ['x', '-y', '-aoa', src, `-o${dist}`]);

        child.stdout.on('data', () => {});
        child.stderr.on('data', console.error);

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(code);
            }
        });

        child.on('error', (err) => {
            reject(err);
        });
    });
}

export function unzipNpm(src, dist) {
    return extract(src, { dir: dist });
}
