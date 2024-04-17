const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// 假设 ZIP 文件位于 'public/downloads/example.zip'，请替换为实际路径
const zipFilePath = path.join(__dirname, 'a.zip');

app.get('/download', (req, res) => {
    // 设置响应头，指定文件名和 Content-Type
    const fileName = path.basename(zipFilePath);
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', 1000000000000);

    // 创建可读流，读取 ZIP 文件
    const readStream = fs.createReadStream(zipFilePath);

    // 当文件读取过程中发生错误时，发送 500 错误响应
    readStream.on('error', (err) => {
        console.error(`Error reading file: ${err.message}`);
        res.status(500).send('Internal Server Error');
    });

    // 将文件流pipe到响应对象上，实现下载功能
    readStream.pipe(res);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
