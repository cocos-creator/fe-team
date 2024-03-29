interface Node {
    type: string;
    parent?: string;
    components: [];
    uuid: string;
}

export const onNodeMenu = async (node: Node) => {
    return [
        {
            label: '拓展节点菜单',
            async click() {
                console.log(node);
            },
        },
    ];
};

export const onPanelMenu = () => {
    return [
        {
            label: '拓展面板菜单',
            click() {
                console.log('拓展面板菜单被点击了');
            },
        },
    ];
};

export const onCreateMenu = () => {
    return [
        {
            label: '拓展创建菜单',
            click() {
                console.log('拓展创建菜单被点击了');
            },
        },
    ];
};

export const onRootMenu = () => {
    return [
        {
            label: '拓展场景节点菜单',
            submenu: [
                {
                    label: '二级菜单',
                    click() {
                        console.log('二级菜单被点击了');
                    },
                },
            ],
        },
    ];
};
