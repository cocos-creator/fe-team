
/**
 * createAssets($0, 150, '9a989f66-f1f0-461d-a54b-0f903071a76c');
 * 在控制台批量复制某个资源，一般用于测试目的
 * @param {HTMLElement} treeDom 控制台选中 asset 面板的 tree dom
 * @param {number} number 需要创建的数量
 * @param {string} uuid 需要复制的资源 uuid
 */
async function copyAssets(treeDom, number, uuid) {
    await treeDom.__vue__.copy(uuid);
    for (const iterator of Array(number)) {
        await treeDom.__vue__.paste(uuid, [uuid]);
    }
}