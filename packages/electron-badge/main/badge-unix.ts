import { app } from 'electron';

import { Badge } from './badge';
import { IbadgeStyleOpt } from './badge-generator';

import type { BrowserWindow } from 'electron';


// mac & linux

export class BadgeUnix extends Badge {
    public constructor(max: number, win: BrowserWindow, style?: Partial<IbadgeStyleOpt>) {
        super(max, win, style);
    }

    public update(val: number): void {
        if (!this.checkVal(val)) {
            throw new Error(`the val must be a Integer and between 0 and ${this.max}`);
        }

        // app.setBadgeCount(99); 支持 Linux 和 Mac，参数 Integer 且最大值 99 （超过 99 会导致程序崩溃）
        // app.dock.setBadge('999') 只支持 Mac
        // 所以在 Mac 上，如果超出最大值，则用 app.dock.setBadge （能显示加号，体验更好）
        // 否则使用  app.setBadgeCount 支持性更好
        if (process.platform === 'darwin') {
            if (val > this.max || val > 99) {
                app.dock.setBadge(this.formatVal(val));
            } else {
                app.setBadgeCount(val);
            }
        } else {
            app.setBadgeCount(Math.min(99, val));
        }
    }

    public clear(): void {
        app.dock.setBadge('');
        app.setBadgeCount(0);
    }
}
