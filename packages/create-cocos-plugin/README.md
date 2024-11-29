# create-cocos-plugin <a href="https://npmjs.com/package/create-cocos-plugin"><img src="https://img.shields.io/npm/v/create-cocos-plugin" alt="npm package"></a>

## Scaffolding Your First COCOS-plugin Project

> **Compatibility Note:**
> create-cocos-plugin dependens on Vite. Vite requires [Node.js](https://nodejs.org/en/) version 18+, 20+. However, some templates require a higher Node.js version to work, please upgrade if your package manager warns about it.

With NPM:

```bash
$ npm create cocos-plugin@latest
```

With Yarn:

```bash
$ yarn create cocos-plugin
```

With PNPM:

```bash
$ pnpm create cocos-plugin
```

With Bun:

```bash
$ bun create cocos-plugin
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use via additional command line options. For example, to scaffold a cocos-plugin + Vue project, run:

```bash
# npm 7+, extra double-dash is needed:
npm create cocos-plugin@latest my-cocos-plugin -- --template vue

# yarn
yarn create cocos-plugin my-cocos-plugin --template vue

# pnpm
pnpm create cocos-plugin my-cocos-plugin --template vue

# Bun
bun create cocos-plugin my-cocos-plugin --template vue
```

Currently supported template presets include:

-   `vanilla`
-   `vue`
-   `vue-element-plus`
-   `react-ts`

You can use `.` for the project name to scaffold in the current directory.
