
import { mkdirp, copy } from 'fs-extra';
import { join, dirname} from 'path';
import { fileURLToPath } from 'url';
import {statSync} from 'fs';

const root = process.cwd();

export default function(project = 'cocos-editor-plugin-demo') {
    const pluginDemoPath = join(root, project);

    try {
        const stats = statSync(pluginDemoPath);
        if (stats.isDirectory()) {
            return console.error(`文件夹 ${pluginDemoPath} 已经存在!`);
        }
    } catch (error) {
        
    }
   
    mkdirp(pluginDemoPath)
        .then(() => {
            const __dirname = fileURLToPath(new URL('.', import.meta.url));
            
            copy(join(__dirname, '../create-template/'), pluginDemoPath, {recursive: true});
        });
       
}