import {readdirSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { join } from 'path';

export default async function computeMetaHash(folder, inputHash = null) {
    const hash = inputHash ? inputHash : createHash('sha256');
    const info = readdirSync(folder, { withFileTypes: true });
    for (const item of info) {
        const fullPath = join(folder, item.name);
        if (item.isFile() && /(\.js)|(\.ts)|(\.vue)$/.test(item.name)) {
            const statInfo = statSync(fullPath);
            // compute hash string name:size:mtime
            const fileInfo = `${fullPath}:${statInfo.size}:${statInfo.mtimeMs}`;
            hash.update(fileInfo);
        } else if (item.isDirectory()) {
            if (/^(node_modules)|(dist)$/.test(item.name)) {
                continue;
            }
            await computeMetaHash(fullPath, hash);
        }
    }
    if (!inputHash) {
        return hash.digest();
    }
}
