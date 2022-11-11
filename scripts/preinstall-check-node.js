/**
 * 注意：
 * 1、这个段脚本不能使用太新的语法，我们要确保在 node >=12 都能顺利执行该脚本
 * 2、不能引入 node_modules 的包，此文件是需要在 install 之前执行的。
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const { Color } = require('./color');

const nvmrc = join(__dirname, '../', '.nvmrc');
const isWin = process.platform === 'win32';
const installNvmLink = isWin ? 'https://github.com/coreybutler/nvm-windows' : 'https://github.com/nvm-sh/nvm';

async function check() {
    if (!existsSync(nvmrc)) return;

    const nodeVersionProject = readFileSync(nvmrc).toString().trim();
    const nodeVersionCurrent = process.versions.node.replace('\'', '');

    // 如 12.22.12 我们只取大版本 12 即可，工作流不应该对版本要求太细致
    // 之所以会在 .nvmrc 里面写完整版本是为了让 Windows 平台的 nvm 可以顺利切换，它需要完整的版本号
    if (nodeVersionProject.split('.')[0] === nodeVersionCurrent.split('.')[0]) {
        console.log(Color.reverse('当前运行的 node 版本符合项目要求的版本:'), Color.green(nodeVersionCurrent));
        console.log();
        return true;
    } else {
        console.log(Color.bright('当前运行的 node 版本和项目要求的版本不同:'));
        console.log('=> 当前运行版本:', Color.green(nodeVersionCurrent));
        console.log('=> 项目要求版本:', Color.green(nodeVersionProject));
        
        log('我们建议您使用 nvm 来管理本机的 node，这样可以让你轻松切换 node 版本！');
        log(Color.blue('安装地址：'), Color.underline(installNvmLink));
        
        log('我们也总结了一些安装 nvm 的常见问题的解决方案供您参考！');
        log(Color.blue('参考地址'), Color.underline('http://cocos.90s.co/core/nvm.html'));
        
        log('当你安装完 nvm 之后，可以执行如下命令，来切换 node 版本:');
        log(Color.green(`nvm install ${nodeVersionProject}`));
        console.log(Color.green(`nvm use ${nodeVersionProject}`));

        log('在完成以上操作之后，您可以重新执行', Color.green('npm install'), '来启动项目！');
        console.log();

        process.exit(1);
    }
}

check();

function log(...str) {
    console.log('');
    console.log(...str);
}
