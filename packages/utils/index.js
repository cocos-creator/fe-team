export async function downloadByLink(link: string, filename: string) {
    const { origin: downloadOrigin } = new URL(link);
    const { origin: siteOrigin } = window.location;
    let href = link;
    // 如果下载的资源，不是在同一个域名下，a标签download设置无效，需要先将资源转为blob，在本地下载
    if (downloadOrigin !== siteOrigin) {
        href = await fetch(link)
            .then((res) => res.blob())
            .then((blob) => window.URL.createObjectURL(blob));
    }

    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    if (href.includes('blob')) {
        window.URL.revokeObjectURL(href);
    }
}

export function isMobile() {
    // eslint-disable-next-line
    return /Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(window.navigator.userAgent);
}

export const getScroll = () => {
    const top =
        window.pageYOffset ||
        document.body.scrollTop ||
        document.documentElement.scrollTop;
    const left =
        window.pageXOffset ||
        document.body.scrollLeft ||
        document.documentElement.scrollLeft;
    return { top, left };
};

export const getOffset = (el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return {
        top: rect.top + getScroll().top,
        left: rect.left + getScroll().left,
        width: rect.width,
        height: rect.height,
    };
};
