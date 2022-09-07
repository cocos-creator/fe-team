
import { mkdir, cp } from 'node:fs/promises';
import { join, dirname} from 'path';
import { fileURLToPath } from 'url';
import {statSync} from 'fs';

const root = process.cwd();

export default function(project = 'create-template') {
    const p = join(root, project);

    try {
        const stats = statSync(p);
        if (stats.isDirectory()) {
            return console.error(`文件夹 ${p} 已经存在!`);
        }
    } catch (error) {
        
    }
   
    mkdir(p, {recursive: true})
        .then(() => {
            const __dirname = dirname(fileURLToPath(import.meta.url));
            
            cp(join(__dirname, '../create-template/'), p, {recursive: true});
        });
       
}