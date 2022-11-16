
export function onBeforeBuild(options) {
    console.log(1122, options);
}

export function onAfterBuild(options, result) {
    console.log(1122, options);
    console.log(1122, result);
}

export function onAfterInit() {
    console.log(1122, 'onAfterInit');
}