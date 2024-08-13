import { ipc_update, ipc_clear } from '../common/index';
import { ipcRenderer } from 'electron';

class BadgeRender {
    update(value: number) {
        ipcRenderer.send(ipc_update, value);
    }

    clear() {
        ipcRenderer.send(ipc_clear);
    }
}

export default new BadgeRender();
