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
    }

    async generate(value: string, opts?: Partial<IbadgeStyleOpt>) {
        const styleOpts = JSON.stringify({ ...this.style, ...opts });

        // IIFE 用于定义并立即执行 drawBadge 函数，并返回结果
        const iifeCode = `
            (function() {
                const drawBadge = function(value, styleOpt) {
                    const { color, background, radius, fontFamily, fontWeight } = styleOpt;
                    let { fontSize } = styleOpt;
    
                    if (value.includes('+')) {
                        fontSize = '11px';
                    }
    
                    const badgeSvg = \`
                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="\${radius * 2}" height="\${radius * 2}">
                            <circle cx="\${radius}" cy="\${radius}" r="\${radius}" fill="\${background}" />
                            <text x="50%" y="50%" text-anchor="middle" fill="\${color}" font-size="\${fontSize}" font-family="\${fontFamily}" font-weight="\${fontWeight}" dy=".3em">\${value}</text>
                        </svg>\`;
    
                    const DOMURL = self.URL || self.webkitURL;
                    const img = new Image();
                    const svg = new Blob([badgeSvg], { type: 'image/svg+xml;charset=utf-8' });
                    const url = DOMURL.createObjectURL(svg);
    
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
                };
    
                // 调用 drawBadge 函数并返回结果
                return drawBadge('${value}', ${styleOpts});
            })();
        `;

        // 执行 IIFE 并获取返回结果
        return this.win.webContents.executeJavaScript(iifeCode).catch((e) => console.error(e));
    }
}
