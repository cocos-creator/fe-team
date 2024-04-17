import { existsSync, createWriteStream } from 'node:fs';
import axios from 'axios';
import type { AxiosProgressEvent, AxiosError } from 'axios';

async function download(url: string, dist: string): Promise<void> {
    if (!url) {
        console.error('The download url is empty');
        return;
    }
    if (!dist) {
        console.error('The download path is empty');
    }
    if (existsSync(dist)) {
        console.error('The file already exists, skip download');
        return;
    }
    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
            // const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            console.log(`Download progress: ${progressEvent.progress}%`, progressEvent);
        },
    });

    // 使用管道流将文件写入到指定路径
    response.data.pipe(createWriteStream(dist));

    return new Promise((resolve, reject) => {
        response.data.on('end', async () => {
            resolve();
        });

        response.data.on('error', (err: AxiosError) => {
            reject(err);
        });
    });
}

// download('https://download.cocos.com/CocosCreator/v3.7.4/CocosCreator-v3.7.4-mac-081414.zip', '/Users/alan/cocos/fe-team/packages-demos/others/download/a.zip');
download('http://localhost:3000/download', '/Users/alan/cocos/fe-team/packages-demos/others/download/b.zip');
