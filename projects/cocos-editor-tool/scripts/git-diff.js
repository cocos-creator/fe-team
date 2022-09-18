const exec = require('child_process').exec;
const GITDIFF = 'git diff --cached --diff-filter=ACMR --name-only';
// 执行 git 的命令
exec(GITDIFF, (error, stdout) => {
    if (error) {
        console.error(`exec error: ${error}`);
    }
    // 对返回结果进行处理，拿到要检查的文件列表
    const diffFileArray = stdout.split('\n').filter((diffFile) => (
        /(\.js|\.jsx)(\n|$)/gi.test(diffFile)
    ));
    console.log('待检查的文件：', diffFileArray);
});
