import { blue, cyan, green, red, reset, yellow } from 'kolorist';

export type ColorFunc = (str: string | number) => string;
export type Framework = {
    name: string;
    display: string;
    color: ColorFunc;
    variants?: FrameworkVariant[];
};
export type FrameworkVariant = {
    name: string;
    display: string;
    color: ColorFunc;
    customCommand?: string; // 自定义创建命令
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
                name: 'vue-ts',
                display: 'TypeScript',
                color: blue,
            },
            {
                name: 'vue',
                display: 'JavaScript',
                color: yellow,
            },
        ],
    },
    {
        name: 'react',
        display: 'React',
        color: cyan,
        variants: [
            {
                name: 'react-ts',
                display: 'TypeScript',
                color: blue,
            },
            {
                name: 'react',
                display: 'JavaScript',
                color: yellow,
            },
        ],
    },
];

export const TEMPLATES = FRAMEWORKS.map((f) => (f.variants && f.variants.map((v) => v.name)) || [f.name]).reduce((a, b) => a.concat(b), []);
