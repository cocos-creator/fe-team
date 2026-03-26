// global
const btnId = 'npm-comparison-add-btn-make-sure-unique';
const containerId = 'npm-comparison-container-make-sure-unique';
const emptyHtml = '<div class="empty" title="empty repository">-</div>';
const emptyMarkdown = '-';
let markdownContent = '';
let markdownVar = '';
const markdownLine = '------------------------------------';

const mainfest = chrome.runtime.getManifest();

// 数据来源： https://flat.badgen.net/npm
const npmBadgeConfigsList = [
  {
    label: 'version',
    value: 'v',
    default: true,
  },
  {
    label: 'weekly download',
    value: 'dw',
    default: true,
  },
  {
    label: 'monthly download',
    value: 'dm',
    default: false,
  },
  {
    label: 'yearly download',
    value: 'dy',
    default: false,
  },
  {
    label: 'total download',
    value: 'dt',
    default: false,
  },
  {
    label: 'license',
    value: 'license',
    default: true,
  },
  {
    label: 'node version',
    value: 'node',
    default: false,
  },
  {
    label: 'dependents',
    value: 'dependents',
    default: true,
  },
  {
    label: 'types',
    value: 'types',
    default: true,
  },
  {
    label: 'install size',
    value: 'size',
    default: true,
    generateImg(pkg, isHtml = true) {
      const link = `https://packagephobia.com/result?p=${pkg.name}`;
      const img = `https://packagephobia.com/badge?p=${pkg.name}`;

      const content = generateBadge(img, 'install size', link);

      return isHtml ? content.html : content.markdown;
    },
  },
];

// 数据来源： https://flat.badgen.net/github
const githubBadgeConfigsList = [
  {
    label: 'license',
    value: 'license',
    default: false,
  },
  {
    label: 'watchers',
    value: 'watchers',
    default: false,
  },
  {
    label: 'branches',
    value: 'branches',
    default: false,
  },
  {
    label: 'releases',
    value: 'releases',
    default: false,
  },
  {
    label: 'tags',
    value: 'tags',
    default: false,
  },
  {
    label: 'latest tag',
    value: 'tag',
    default: false,
  },
  {
    label: 'stars',
    value: 'stars',
    default: true,
    generateImg(package, isHtml = true) {
      // shields 的 stars 更美观
      const githubURL = getGithubURL(package);
      const imgURL = githubURL ? `https://img.shields.io/github/stars/${getAutor(githubURL)}/${getRepo(githubURL) || package.name}?color=white&label` : '';

      const content = generateBadge(imgURL, 'stars', package.homepage);

      return isHtml ? content.html : content.markdown;
    },
  },
  {
    label: 'forks',
    value: 'forks',
    default: false,
  },
  {
    label: 'commits count',
    value: 'commits',
    default: false,
  },
  {
    label: 'last commit',
    value: 'last-commit',
    default: true,
  },
  {
    label: 'issues',
    value: 'issues',
    default: true,
  },
  {
    label: 'open issues',
    value: 'open-issues',
    default: true,
  },
  {
    label: 'closed issues',
    value: 'closed-issues',
    default: true,
  },
];

// 其他配置
const themeConfigsList = [
  {
    label: 'Transpose table',
    value: 'transpose-table',
    default: false,
  },
];

(async function () {
  await initPanle();
  initAddBtn();
  render();
  observerTitle();
})();

// 如果在 https://www.npmjs.com/package/vue 这样的详情页面直接搜索其他 npm 包，比如 vite
// 在搜索下拉列表选择 vite ，此时虽然页面地址会变化，但是似乎并不会触发关于路由变化的事件，也不会刷新页面
// 于是决定来监听页面标题部分，如果这边有变化，说明有更新，进行一次重新初始化的操作
function observerTitle() {
  const mb = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'characterData') {
        console.log('characterData');
        initAddBtn();
        toggleAddBtnHidden();
      }
    }
  });
  mb.observe(document.querySelector('#main h1'), { childList: true, subtree: true, characterData: true });
}

async function getStorage(key, defaultValue) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) {
        resolve(defaultValue);
      } else {
        resolve(result[key] ?? defaultValue);
      }
    });
  });
}

async function getPackageList() {
  return getStorage('packageList', []);
}

async function fetchPackageData(list) {
  const result = [];
  for (const packageName of list) {
    try {
      const response = await fetch('https://registry.npmjs.org/' + decodeURIComponent(packageName));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      result.push(data);
    } catch (error) {
      console.error('Error fetching data for package:', packageName, error);
    }
  }
  return result;
}

async function render(list) {
  if (!Array.isArray(list)) {
    list = await getPackageList();
  }

  toggleAddBtnHidden(list);

  const $panel = document.getElementById(containerId);

  $panel.classList.toggle('empty', list.length === 0);

  let container = $panel.querySelector('section.body');
  if (!container) {
    return;
  }

  if (!list.length) {
    container.innerHTML = '';
    return;
  }

  const npmBadgeUser = await getStorage('npm', {});
  const npmBadgeConfigsListChecked = npmBadgeConfigsList.filter((c) => npmBadgeUser[c.value] ?? c.default);

  const githubBadgeUser = await getStorage('github', {});
  const githubBadgeConfigsListChecked = githubBadgeConfigsList.filter((c) => githubBadgeUser[c.value] ?? c.default);

  const fragment = document.createDocumentFragment();
  const packageList = await fetchPackageData(list);

  const isTransposed = (await getStorage('theme', {}))['transpose-table'];

  if (isTransposed) {
    packageList.forEach((pkg) => {
      const row = document.createElement('tr');
      row.innerHTML = `
      <td>
        ${generateTitle(pkg)}
      </td>
         ${npmBadgeConfigsListChecked.map((config) => `<td>${generateNpmImg(config, pkg)}</td>`).join('')}
        ${githubBadgeConfigsListChecked.map((config) => `<td>${generateGithubImg(config, pkg)}</td>`).join('')}  
    `;
      fragment.appendChild(row);
    });

    container.innerHTML = `
      <table>
          <thead>
              <tr>
                  <th>Package Name</th>
                ${[...npmBadgeConfigsListChecked, ...githubBadgeConfigsListChecked].map((config) => `<th>${config.label}</th>`).join('')}
              </tr>
          </thead>
          <tbody></tbody>
      </table>
    `;
  } else {
    npmBadgeConfigsListChecked.forEach((config) => {
      const row = document.createElement('tr');
      row.innerHTML = `
     
      <td>${config.label}</td>
         ${packageList.map((pkg) => `<td>${generateNpmImg(config, pkg)}</td>`).join('')}
    `;
      fragment.appendChild(row);
    });

    githubBadgeConfigsListChecked.forEach((config) => {
      const row = document.createElement('tr');
      row.innerHTML = `
     
      <td>${config.label}</td>
         ${packageList.map((pkg) => `<td>${generateGithubImg(config, pkg)}</td>`).join('')}
    `;
      fragment.appendChild(row);
    });

    container.innerHTML = `
          <table>
              <thead>
                  <tr>
                      <th></th>
                    ${packageList.map((pkg) => `<th>${generateTitle(pkg)}</th>`).join('')}
                  </tr>
              </thead>
              <tbody></tbody>
          </table>
    `;
  }

  container.querySelector('tbody').appendChild(fragment);

  markdownContent = generateMarkdownTable(packageList, npmBadgeConfigsListChecked, githubBadgeConfigsListChecked, isTransposed);

  if (mainfest.name.includes('-development')) {
    console.log('Package Data:', packageList);
  }
}

function initAddBtn() {
  let $btn = document.getElementById(btnId);

  if ($btn) {
    $btn.remove();
  } else {
    $btn = document.createElement('button');
    $btn.id = btnId;
    $btn.className = 'button-72';
    $btn.textContent = 'Add to npm Comparison';
  }
  document.querySelector('#main h1').appendChild($btn);
  $btn.addEventListener('click', async () => {
    const list = await getPackageList();
    const package = location.pathname.replace('/package/', '');
    if (!list.includes(package)) {
      list.push(package);
      chrome.storage.sync.set({ packageList: list }, () => {
        render(list);
        document.getElementById(containerId).classList.remove('hide');
      });
    }
  });
}

async function initPanle() {
  const $panel = document.createElement('div');
  $panel.id = containerId;

  const npmConfig = await getStorage('npm', {});
  const githubConfig = await getStorage('github', {});
  const themeConfig = await getStorage('theme', {});

  $panel.innerHTML = `
    <div class="toggle-show-panel"></div>
    <section class="container">
       <section class="header">
          <details>
            <summary></summary>
            ${renderConfigPanle('npm', npmBadgeConfigsList, npmConfig)}
            ${renderConfigPanle('github', githubBadgeConfigsList, githubConfig)}
            ${renderConfigPanle('theme', themeConfigsList, themeConfig)}
          </details>
        </section>
        <section class="tool">
          <button class="copy-markdown button-72">copy table to markdown</button>
          <button class="copy-html button-72">copy table to html</button>
        </section>
        <section class="body">
        </section>
        <section class="footer">
          <button class="clear button-72">clear all</button>
        </section>
    </section>
  `;

  $panel.addEventListener(
    'change',
    async (e) => {
      const type = e.target.dataset.type;
      if (!/(npm)|(github)|(theme)/.test(type)) return;

      const badge = e.target.name;
      const value = e.target.checked;

      const _data = await getStorage(type, {});
      Object.assign(_data, { [badge]: value });

      chrome.storage.sync.set({ [type]: _data }, () => {
        render();
      });
    },
    false
  );

  $panel.addEventListener(
    'click',
    async (e) => {
      if (e.target.dataset.package) {
        const package = e.target.dataset.package;
        const list = await getPackageList();
        const i = list.indexOf(package);

        if (i !== -1) {
          list.splice(i, 1);
          chrome.storage.sync.set({ packageList: list }, () => {
            render(list);
          });
        }
      }
    },
    false
  );

  // 显示隐藏
  $panel.querySelector('.toggle-show-panel').addEventListener('click', () => {
    $panel.classList.toggle('hide');
    chrome.storage.sync.set({ hidePanel: $panel.classList.contains('hide') });
  });
  getStorage('hidePanel', false).then((v) => {
    $panel.classList.toggle('hide', v);
  });

  // 复制 markdown
  $panel.querySelector('.copy-markdown').addEventListener(
    'click',
    (e) => {
      copy(e.target, markdownContent + markdownVar);
    },
    false
  );

  // 复制 html
  $panel.querySelector('.copy-html').addEventListener(
    'click',
    (e) => {
      const tableStr = generateHTMLTable();
      copy(e.target, tableStr);
    },
    false
  );

  $panel.querySelector('.footer .clear').addEventListener(
    'click',
    () => {
      chrome.storage.sync.set({ packageList: [] }, () => {
        render([]);
      });
    },
    false
  );

  document.body.appendChild($panel);
}

// 更新按钮的可见性
async function toggleAddBtnHidden(packageList) {
  const $btn = document.getElementById(btnId);
  if (!$btn) return;

  if (location.pathname.startsWith('/package/')) {
    if (!Array.isArray(packageList)) {
      packageList = await getPackageList();
    }

    const package = location.pathname.replace('/package/', '');

    $btn.classList.toggle('hidden', packageList.includes(package));
  } else {
    $btn.classList.add('hidden');
  }
}

function renderConfigPanle(type, configsList, configUser) {
  return `
    <div class="panel ${type}">
      <h3>${type}</h3>
      <div class="list">
        ${configsList
          .map((config) => {
            return `
            <div class="item">
              <input
                data-type="${type}"
                type="checkbox"
                id="${type}-${config.value}" 
                name="${config.value}" 
                ${configUser[config.value] ?? config.default ? 'checked' : ''} 
              />
              <label for="${type}-${config.value}">${config.label}</label>
            </div>
            `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function getGithubURL(pkg) {
  // 从包信息中尽量找到 github 的仓库地址，用来解析 作者 和 仓库名称
  return pkg.repository?.url || pkg.bugs?.url.replace('/issues', '') || pkg.homepage;
}

const githubRegex = /github\.com[\/:]([^\/]+)\/([^\/.]+)(?:\.git)?$/;
function getAutor(githubURL) {
  const match = githubURL.match(githubRegex);
  if (match) {
    return match[1];
  }
  return null;
}

// 有的 npm 包名和仓库名并不是一致的
// 比如 git+https://github.com/archiverjs/node-zip-stream.git
// npm: zip-stream vs  github:node-zip-stream
// 所以在获取 github 相关图标时要用仓库名称
function getRepo(githubURL) {
  const match = githubURL.match(githubRegex);
  return match ? match[2] : null;
}

function generateNpmImg(config, pkg, isHtml = true) {
  if (typeof config.generateImg === 'function') {
    return config.generateImg(pkg, isHtml);
  }
  const imgURL = `https://flat.badgen.net/npm/${config.value}/${pkg.name}`;

  const content = generateBadge(imgURL, config.label);

  return isHtml ? content.html : content.markdown;
}

function generateGithubImg(config, pkg, isHtml = true) {
  if (typeof config.generateImg === 'function') {
    return config.generateImg(pkg, isHtml);
  }
  const githubURL = getGithubURL(pkg);
  const imgURL = githubURL ? `https://flat.badgen.net/github/${config.value}/${getAutor(githubURL)}/${getRepo(githubURL) || pkg.name}` : '';

  const content = generateBadge(imgURL, config.label);

  return isHtml ? content.html : content.markdown;
}

function generateTitle(pkg, isHtml = true) {
  if (isHtml) {
    return `<div class="title">
    <a href="https://www.npmjs.com/package/${pkg.name}" target="_blank">${pkg.name}</a>
    <span class="delete" data-package="${pkg.name}">❌</span>
  </div>`;
  }

  return `[${pkg.name}](https://www.npmjs.com/package/${pkg.name})`;
}

function generateMarkdownTable(packagelist, npmList, githubList, isTransposed = false) {
  if (!Array.isArray(packagelist) || !Array.isArray(npmList) || !Array.isArray(githubList)) return;
  let markdown = '';

  // 这个是全局的变量，每次转换先清空一次
  markdownVar = '\n'; // 用来保存提取出来的 link 和 img 的变量

  if (isTransposed) {
    const badges = [
      ...npmList.map((v) => {
        v.__is_npm = true;
        return v;
      }),
      ...githubList,
    ];
    const header = `| ${padTableCellToMatchDashLength('package name')} | ${badges.map((config) => padTableCellToMatchDashLength(config.label)).join(' | ')}  | \n`;
    markdown += header;
    markdown += `| ${markdownLine} | ${badges.map(() => markdownLine).join(' | ')}  |\n`;
    packagelist.forEach((pkg) => {
      markdown += `| ${convertMarkdownSafely(generateTitle(pkg, false))} | ${badges
        .map((config) => {
          if (config.__is_npm) {
            return convertMarkdownSafely(generateNpmImg(config, pkg, false));
          }
          return convertMarkdownSafely(generateGithubImg(config, pkg, false));
        })
        .join(' | ')} | \n`;
    });
  } else {
    const header = `| ${padTableCellToMatchDashLength('')} | ${packagelist.map((v) => convertMarkdownSafely(generateTitle(v, false))).join(' | ')} | \n`;
    markdown += header;

    markdown += `| ${markdownLine} | ${packagelist.map(() => markdownLine).join(' | ')} |\n`;

    npmList.forEach((config) => {
      markdown += `| ${padTableCellToMatchDashLength(config.label)} | ${packagelist.map((pkg) => convertMarkdownSafely(generateNpmImg(config, pkg, false))).join(' | ')} | \n`;
    });

    githubList.forEach((config) => {
      markdown += `| ${padTableCellToMatchDashLength(config.label)} | ${packagelist.map((pkg) => convertMarkdownSafely(generateGithubImg(config, pkg, false))).join(' | ')} | \n`;
    });
  }
  return markdown;
}

function generateHTMLTable(tableSelector, filterFunction) {
  const originalTable = document.querySelector(`#${containerId} table`);
  if (!originalTable) {
    return '';
  }

  const clonedTable = originalTable.cloneNode(true);

  const elementsToRemove = Array.from(clonedTable.querySelectorAll('.delete'));
  elementsToRemove.forEach((el) => el.remove());

  const tempContainer = document.createElement('div');
  tempContainer.appendChild(clonedTable);
  const htmlString = tempContainer.innerHTML;

  return htmlString;
}

function copy($, str) {
  navigator.clipboard.writeText(str).then(() => {
    const old = $.textContent;
    $.textContent = 'copy success!!';
    setTimeout(() => {
      $.textContent = old;
    }, 2000);
  });
}

function generateBadge(img, alt = 'badge image', link) {
  if (!img) {
    return {
      html: emptyHtml,
      markdown: emptyMarkdown,
    };
  }

  const imgHTML = `<img alt="${alt}" src="${img}" />`;
  const imgMD = `![${alt}](${img})`;
  return {
    html: link ? `<a href="${link}" target="_blank">${imgHTML}</a>` : imgHTML,
    markdown: link ? `[${imgMD}](${link})` : imgMD,
  };
}

// 将 markdown 内容转为变量的格式，这样在 markdown 文档中内容看着会比较舒服，也方便后续想调整表格的顺序
function generateId(prefix = '') {
  return prefix + Math.random().toString(36).substring(2, 8);
}

function convertMarkdown(md) {
  md = md.trim();

  // 情况 1：图片带链接
  const imageWithLink = md.match(/\[!\[([^\]]*)\]\((.*?)\)\]\((.*?)\)/);
  if (imageWithLink) {
    const alt = imageWithLink[1] || '';
    const imgUrl = imageWithLink[2];
    const linkUrl = imageWithLink[3];

    const uuid = generateId();
    const imgVar = uuid + '_img';
    const linkVar = uuid + '_link';

    return {
      variable: `[${linkVar}]: ${linkUrl}\n` + `[${imgVar}]: ${imgUrl}\n`,
      content: `[![${alt}][${imgVar}]][${linkVar}]`,
    };
  }

  // 情况 2：仅图片
  const imageOnly = md.match(/!\[([^\]]*)\]\((.*?)\)/);
  if (imageOnly) {
    const alt = imageOnly[1] || '';
    const imgUrl = imageOnly[2];

    const imgVar = generateId('img_');

    return {
      variable: `[${imgVar}]: ${imgUrl}\n`,
      content: `![${alt}][${imgVar}]`,
    };
  }

  // 情况 3：仅链接
  const linkOnly = md.match(/\[([^\]]+)\]\((.*?)\)/);
  if (linkOnly) {
    const text = linkOnly[1];
    const linkUrl = linkOnly[2];

    const linkVar = generateId('link_');

    return {
      variable: `[${linkVar}]: ${linkUrl}\n`,
      content: `[${text}][${linkVar}]`,
    };
  }

  return null;
}

function convertMarkdownSafely(originMD) {
  const md = convertMarkdown(originMD);
  if (md) {
    // 变量提取成功，将变量写入 markdownVar
    markdownVar += md.variable;
    return padTableCellToMatchDashLength(md.content);
  } else {
    // 变量提取失败，返回原数据，不影响 Markdown 展示
    return padTableCellToMatchDashLength(originMD);
  }
}

function padTableCellToMatchDashLength(str) {
  if (str.length >= markdownLine.length) return str;

  const padding = markdownLine.length - str.length;
  const leftPadding = ' '.repeat(Math.floor(padding / 2));
  const rightPadding = ' '.repeat(Math.ceil(padding / 2));

  return leftPadding + str + rightPadding;
}
