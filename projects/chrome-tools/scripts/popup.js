document.getElementById('goOption').addEventListener(
    'click',
    () => {
        window.open(`chrome-extension://${chrome.runtime.id}/options.html`);
    },
    false,
);
