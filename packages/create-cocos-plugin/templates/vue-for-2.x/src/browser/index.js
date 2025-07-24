import { name } from '../../package.json' with { type: 'json' };

export const messages = {
    open() {
        Editor.Panel.open(name);
    },
    increase() {
        // send ipc message to panel
        Editor.Ipc.sendToPanel(name, `${name}:increase`);
    },
    clicked() {
        Editor.log('Button clicked!');
    },
};

export async function load() {
    console.log(`load ${name}`);
}

export function unload() {
    console.log(`unload ${name}`);
}
