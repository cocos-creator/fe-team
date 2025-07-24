import { blue, green, yellow, cyan } from 'picocolors';

export type ColorFunc = (str: string | number) => string;
export type Framework = {
    name: string;
    display: string;
    color: ColorFunc;
    variants?: FrameworkVariant[];
    hidden?: boolean; // 是否隐藏在创建列表中
};
export type FrameworkVariant = {
    name: string;
    display: string;
    color: ColorFunc;
    customCommand?: string; // 自定义创建命令
    hidden?: boolean; // 是否隐藏在创建列表中
};

export const FRAMEWORKS: Framework[] = [
    {
        name: 'vanilla',
        display: 'Vanilla',
        color: yellow,
    },
    {
        name: 'vue',
        display: 'Vue',
        color: green,
        variants: [
            {
                name: 'vue-element-plus',
                display: 'vue + element plus',
                color: blue,
            },
            {
                name: 'vue',
                display: 'vue only',
                color: yellow,
            },
            {
                name: 'vue-for-2.x',
                display: 'vue-for-2.x',
                color: cyan,
                hidden: true,
            },
        ],
    },
    {
        name: 'react-ts',
        display: 'React',
        color: cyan,
        hidden: true,
    },
];

export const TEMPLATES = FRAMEWORKS.map((f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]).reduce((a, b) => a.concat(b), []);
