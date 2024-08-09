import type { BrowserWindow } from 'electron';

export type IbadgeStyleOpt = {
    color: string;
    background: string;
    radius: number;
    fontSize: string;
    fontFamily: string;
    fontWeight: string;
};

const defaultStyle = {
    color: 'white',
    background: 'red',
    radius: 10,
    fontSize: '12px',
    fontFamily: 'Arial',
    fontWeight: 'bold',
};

export default class BadgeGenerator {
    private win: BrowserWindow;
    private style: IbadgeStyleOpt = defaultStyle;

    constructor(win: BrowserWindow, styleOpts: Partial<IbadgeStyleOpt> = {}) {
        this.win = win;
        this.style = Object.assign(defaultStyle, styleOpts);

        // 往渲染进程注册一个函数
        this.win.webContents.executeJavaScript(`window.drawBadge = function ${this.drawBadge};`);
    }

    generate(value: string, opts?: Partial<IbadgeStyleOpt>) {
        const styleOpts = JSON.stringify({ ...this.style, ...opts });

        return this.win.webContents.executeJavaScript(`window.drawBadge(${value}, ${styleOpts});`, true);
    }

    // 这个函数会被注入到渲染进程
    private drawBadge(value: string, styleOpt: IbadgeStyleOpt) {
        const { color, background, radius, fontFamily, fontWeight } = styleOpt;
        let { fontSize } = styleOpt;

        if (value.includes('+')) {
            fontSize = '11px';
        }

        const badgeSvg = `
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="${radius * 2}" height="${radius * 2}">
                <circle cx="${radius}" cy="${radius}" r="${radius}" fill="${background}" />
                <text x="50%" y="50%" text-anchor="middle" fill="${color}" font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}" dy=".3em">${value}</text>
            </svg>`;

        // @ts-ignore 如下代码会注入到渲染进程，所以 self 是存在的
        const DOMURL = self.URL || self.webkitURL;

        // @ts-ignore 如下代码会注入到渲染进程，所以 Image 是存在的
        const img = new Image();
        const svg = new Blob([badgeSvg], { type: 'image/svg+xml;charset=utf-8' });
        const url = DOMURL.createObjectURL(svg);

        // @ts-ignore 如下代码会注入到渲染进程，所以 document 是存在的
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 16;
        canvas.height = 16;

        return new Promise((resolve, reject) => {
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 16, 16);
                const png = canvas.toDataURL('image/png');

                DOMURL.revokeObjectURL(png);

                resolve(png);
            };

            img.onerror = reject;

            img.src = url;
        });
    }
}
