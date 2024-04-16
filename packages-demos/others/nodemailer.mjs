import nodemailer from 'nodemailer';

// 创建一个 transporter 实例，配置 SMTP 服务提供商的凭据
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com', // 替换为实际 SMTP 服务器主机名
    port: 587, // 或其他适用端口，如 465（SSL）、25（非加密）
    secure: false, // 使用 SSL/TLS 连接，如果是非标准端口，通常应设为 true
    auth: {
        user: '741484865@qq.com', // 替换为您的邮箱用户名或邮箱地址
        pass: 'lfqvfktuspembbbc', // 替换为您的邮箱密码或应用生成的授权码
    },
    // 其他可选配置，如 TLS 特定选项、代理设置等
});

// 定义邮件内容
const mailOptions = {
    from: '"袁炜海" <741484865@qq.com>', // 发件人姓名和地址
    to: 'yuanweihai25@163.com', // 收件人地址，可以是单个或数组 ['user1@example.com', 'user2@example.com']
    subject: '邮件主题', // 邮件主题
    text: 'This is a plain-text email body.', // 纯文本邮件正文
    // html: '<p>This is an <strong>HTML</strong> email body.</p>', // HTML 格式的邮件正文（可选）

    // 附件（可选）
    // attachments: [
    //     {
    //         filename: 'example.txt',
    //         path: './path/to/example.txt',
    //     },
    //     {
    //         filename: 'image.png',
    //         path: './path/to/image.png',
    //         cid: 'unique-image-id', // Content-Id for inline embedding
    //     },
    // ],
};

// 发送邮件
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Failed to send email:', error);
    } else {
        console.log('Email sent successfully. Response:', info);
    }
});
