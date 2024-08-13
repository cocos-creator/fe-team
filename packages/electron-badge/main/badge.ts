import { IbadgeStyleOpt } from './badge-generator';
import type { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import { ipc_update, ipc_clear } from '../common/index';

export abstract class Badge {
    max = 99;

    constructor(max: number, win: BrowserWindow, style?: Partial<IbadgeStyleOpt>) {
        this.max = max;

        ipcMain.on(ipc_update, (event, value: number) => {
            this.update(value);
        });

        ipcMain.on(ipc_clear, () => {
            this.clear();
        });
    }

    // 如果超过最大值，则显示为 99+
    protected formatVal(val: number): string {
        return val > this.max ? `${this.max}+` : String(val);
    }

    // 校验
    protected checkVal(val: number): boolean {
        return Number.isInteger(val) && val > 0;
    }

    abstract update(val: number): void;

    abstract clear(): void;
}
