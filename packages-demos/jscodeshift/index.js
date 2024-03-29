const { run: jscodeshift } = require('jscodeshift/src/Runner');
const { resolve } = require('node:path');

const transformPath = resolve(__dirname, './transform.js'); // 指定转换文件
const sourceFile = resolve(__dirname, './source.js'); // 指定源文件

const options = {
    dry: false, // false: 代表写入源文件
    print: false,
    verbose: 0,
};

(async function go() {
    await jscodeshift(transformPath, [sourceFile], options);
})();