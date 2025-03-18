import { ipcRenderer } from 'electron';

import { ipc_update, ipc_clear } from '../common/index';

class BadgeRender {
    update(value: number) {
        ipcRenderer.send(ipc_update, value);
    }

    clear() {
        ipcRenderer.send(ipc_clear);
    }
}

export default new BadgeRender();
