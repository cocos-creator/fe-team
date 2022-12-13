import Vue from 'vue';

/**
 * bem helper
 * b() // 'button'
 * b('text') // 'button__text'
 * b({ disabled }) // 'button button--disabled'
 * b('text', { disabled }) // 'button__text button__text--disabled'
 * b(['disabled', 'primary']) // 'button button--disabled button--primary'
 */

export type Mod = string | { [key: string]: any }
export type Mods = Mod | Mod[]

const ELEMENT = '__';
const MODS = '--';
const PREFIX = '';

function join(name: string, el?: string, symbol?: string): string {
    return el ? name + symbol + el : name;
}

function prefix(name: string, mods: Mods): Mods {
    if (mods === '') return '';

    if (typeof mods === 'string') {
        return join(name, mods, MODS);
    }

    if (Array.isArray(mods)) {
        return mods.map((item) => prefix(name, item));
    }

    const ret: Mods = {};
    if (mods) {
        Object.keys(mods).forEach((key) => {
            ret[name + MODS + key] = mods[key];
        });
    }

    return ret;
}

function bem(
    this: { $options: { name: string } },
    el?: Mods,
    mods?: Mods,
): Mods {
    if (el && typeof el !== 'string') {
        mods = el;
        el = '';
    }
    el = join(PREFIX + this.$options.name, el, ELEMENT);

    return mods ? [el, prefix(el, mods)] : el;
}

function bemJoin(el?: Mods, mods?: Mods): Mods {
    if (el && typeof el !== 'string') {
        mods = el;
        el = '';
    }
    el = '' + el;

    return mods ? [el, prefix(el, mods)] : el;
}

bem.PREFIX = PREFIX;

const Bem = {
    install(Vue: Vue.VueConstructor) {
        Vue.prototype.bem = bem;
        Vue.prototype.bemJoin = bemJoin;
    },
};

Vue.use(Bem);
