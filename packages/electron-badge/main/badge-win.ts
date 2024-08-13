import { Badge } from './badge';
import type { BrowserWindow } from 'electron';
import { nativeImage } from 'electron';
import BadgeGenerator, { IbadgeStyleOpt } from './badge-generator';

const badgeDescription = 'downloading count';

export class BadgeWin extends Badge {
    win: BrowserWindow;
    generator: BadgeGenerator;

    constructor(max: number, win: BrowserWindow, style?: Partial<IbadgeStyleOpt>) {
        super(max, win);
        this.win = win;
        this.generator = new BadgeGenerator(win, style);
    }

    update(val: number): void {
        if (!this.checkVal(val)) {
            throw new Error(`the val must be a Integer and between 0 and ${this.max}`);
        }

        // TODO: 由于是异步生成图片，存在时序不可控的问题，如何保持顺序
        this.generator
            .generate(this.formatVal(val))
            .then((image) => {
                this.win.setOverlayIcon(nativeImage.createFromDataURL(image), badgeDescription);
            })
            .catch(() => {
                this.clear();
            });
    }

    clear(): void {
        this.win.setOverlayIcon(null, badgeDescription);
    }
}
